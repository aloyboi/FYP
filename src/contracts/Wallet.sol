// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interface/IERC20.sol";
import "./Exchange.sol";

/// @notice Library SafeMath used to prevent overflows and underflows
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    using SafeMath for uint256; //for prevention of integer overflow

    address public immutable Owner;

    //For prevention of reentrancy
    bool private locked;

    address public ethToken = address(0);
    address public aETH = address(0x22404B0e2a7067068AcdaDd8f9D586F834cCe2c5);

    mapping(address => mapping(address => uint256)) public s_tokens; //tokenAdress -> msg.sender -> tokenAmt
    mapping(address => mapping(address => uint256)) public lockedFunds;

    Exchange exchange;
    IERC20 token;

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    /// @notice Event when amount withdrawn exchange
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    constructor() {
        Owner = msg.sender;
    }

    function depositETH() external payable {
        updateBalance(ethToken, msg.sender, msg.value, true);

        emit Deposit(
            ethToken,
            msg.sender,
            msg.value,
            balanceOf(ethToken, msg.sender)
        );
    }

    function withdrawETH(uint256 _amount) external {
        require(
            balanceOf(ethToken, msg.sender).sub(
                getlockedFunds(msg.sender, ethToken)
            ) >= _amount,
            "Insufficient balance ETH to withdraw"
        );
        require(!locked, "Reentrant call detected!");
        locked = true;
        updateBalance(ethToken, msg.sender, _amount, false);
        locked = false;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "failed to send amount");

        emit Withdraw(
            ethToken,
            msg.sender,
            _amount,
            balanceOf(ethToken, msg.sender)
        );
    }

    //from and transferFrom is from ERC20 contract
    //_token should be an ERC20 token
    function depositToken(
        address _token,
        uint256 _amount,
        uint256 _decimals
    ) external {
        require(_token != ethToken);
        require(
            exchange.isVerifiedToken(_token),
            "Token not verified on Exchange"
        );
        //need to add a check to prove that it is an ERC20 token
        token = IERC20(_token);

        //Requires approval first
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "No Approval yet"
        );
        uint256 decimals = 18;
        if (_decimals == 18) {
            updateBalance(_token, msg.sender, _amount, true);
        } else
            updateBalance(
                _token,
                msg.sender,
                _amount.mul(10 ** decimals.sub(_decimals)),
                true
            );

        emit Deposit(
            _token,
            msg.sender,
            _amount,
            balanceOf(_token, msg.sender)
        );
    }

    function withdrawToken(
        address _token,
        uint256 _amount,
        uint256 _decimals
    ) external {
        require(_token != ethToken);
        require(
            exchange.isVerifiedToken(_token),
            "Token not verified on Exchange"
        );

        require(
            balanceOf(_token, msg.sender).sub(
                getlockedFunds(msg.sender, _token)
            ) >= _amount,
            "Insufficient Tokens to withdraw"
        );
        require(!locked, "Reentrant call detected!");
        locked = true;

        token = IERC20(_token);
        uint256 decimals = 18;
        if (_decimals == 18) {
            updateBalance(_token, msg.sender, _amount, false);
            require(token.transfer(msg.sender, _amount));
        } else {
            updateBalance(
                _token,
                msg.sender,
                _amount.mul(10 ** decimals.sub(_decimals)),
                false
            );
            require(
                token.transfer(
                    msg.sender,
                    _amount.div(10 ** decimals.sub(_decimals))
                )
            );
        }

        locked = false;
        emit Withdraw(
            _token,
            msg.sender,
            _amount,
            balanceOf(_token, msg.sender)
        );
    }

    function getlockedFunds(
        address _user,
        address _token
    ) public view returns (uint256) {
        return lockedFunds[_user][_token];
    }

    function updateLockedFunds(
        address _user,
        address _token,
        uint256 _amount,
        bool isAdd
    ) public isAuthorised {
        if (isAdd) {
            lockedFunds[_user][_token] = lockedFunds[_user][_token].add(
                _amount
            );
        } else if (!isAdd) {
            lockedFunds[_user][_token] = lockedFunds[_user][_token].sub(
                _amount
            );
        }
    }

    //balance of specific tokens in the dex owned by specific user
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return s_tokens[_token][_user];
    }

    function updateBalance(
        address _token,
        address _user,
        uint256 _amount,
        bool isAdd
    ) public isAuthorised {
        if (isAdd) {
            s_tokens[_token][_user] = s_tokens[_token][_user].add(_amount);
        } else if (!isAdd) {
            s_tokens[_token][_user] = s_tokens[_token][_user].sub(_amount);
        }
    }

    function updateExchangeAddress(address _exchangeAddress) public onlyOwner {
        exchange = Exchange(_exchangeAddress);
    }

    modifier isAuthorised() {
        require(
            msg.sender == address(this) || msg.sender == address(exchange),
            "Unauthorised Function Call"
        );
        _;
    }
}
