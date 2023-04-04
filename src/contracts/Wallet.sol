// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./Exchange.sol";
import "./AMM.sol";

/// @notice Library SafeMath used to prevent overflows and underflows
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    using SafeMath for uint256; //for prevention of integer overflow

    address public fundWallet;
    uint256 decimals = 18;
    address public aDAI;

    //For prevention of reentrancy
    bool private locked;

    address public ethToken = address(0);

    mapping(address => mapping(address => uint256)) public s_tokens; //tokenAdress -> msg.sender -> tokenAmt
    mapping(address => mapping(address => uint256)) public lockedFunds;

    Exchange exchange;
    AMM amm;
    IERC20 token;

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    /// @notice Event when amount withdrawn exchange
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

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
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "failed to send amount");
        locked = false;

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
        require(_token != ethToken, "Invalid Token Type");
        require(
            exchange.isVerifiedToken(_token) || _token == aDAI,
            "Token not verified on Exchange"
        );
        //need to add a check to prove that it is an ERC20 token
        token = IERC20(_token);

        //Requires approval first
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "No Approval yet"
        );

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

    function exchangeUpdateLockedFunds(
        address _user,
        address _token,
        uint256 _amount,
        bool isAdd
    ) external isExchange {
        updateLockedFunds(_user, _token, _amount, isAdd);
    }

    function updateLockedFunds(
        address _user,
        address _token,
        uint256 _amount,
        bool isAdd
    ) internal {
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

    function exchangeUpdateBalance(
        address _token,
        address _user,
        uint256 _amount,
        bool isAdd
    ) external isExchange {
        updateBalance(_token, _user, _amount, isAdd);
    }

    function updateBalance(
        address _token,
        address _user,
        uint256 _amount,
        bool isAdd
    ) internal {
        if (isAdd) {
            s_tokens[_token][_user] = s_tokens[_token][_user].add(_amount);
        } else if (!isAdd) {
            s_tokens[_token][_user] = s_tokens[_token][_user].sub(_amount);
        }
    }

    function updateFundWallet(address _fundwallet) public onlyOwner {
        fundWallet = _fundwallet;
    }

    function withdrawToFundWallet(address _token, uint256 _decimals) external {
        //Only allow fundWallet address to make the call
        require(
            msg.sender == fundWallet,
            "Invalid FundWallet address to withdraw"
        );
        uint256 totalAmount = s_tokens[_token][fundWallet];
        uint256 actualAmount = totalAmount.div(10 ** decimals.sub(_decimals));
        token = IERC20(_token);

        require(!locked, "Reentrant call detected!");
        locked = true;
        updateBalance(_token, fundWallet, totalAmount, false);
        require(token.transfer(fundWallet, actualAmount));
        locked = false;
    }

    function updateExchangeAddress(address _exchangeAddress) public onlyOwner {
        exchange = Exchange(_exchangeAddress);
    }

    function updateAMMAddress(address _AMM) public onlyOwner {
        amm = AMM(_AMM);
    }

    function updateaDaiAddress(address _address) public onlyOwner {
        aDAI = address(_address);
    }

    modifier isExchange() {
        require(
            msg.sender == address(exchange) || msg.sender == address(amm),
            "Not Exchange or AMM contract"
        );
        _;
    }
}
