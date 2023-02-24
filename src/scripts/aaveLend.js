import { ethers } from "ethers";
//import ILendingPoolAddressProvider from "../artifacts/contracts/interface/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";
import LendingPool from "../artifacts/contracts/interface/IPool.sol/IPool.json";
import ERC20 from "../artifacts/contracts/interface/IERC20.sol/IERC20.json";
const { networkConfig } = require("../helper-hardhat-config");

const addressProvider = process.env.REACT_APP_LENDINGPOOLADDRESSPROVIDER;

// export async function getLendingPool() {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     const lendingPoolAddressesProvider = new ethers.Contract(
//         addressProvider,
//         ILendingPoolAddressProvider,
//         signer
//     );
//     console.log(lendingPoolAddressesProvider.address);

//     const lendingPoolAddress = await lendingPoolAddressesProvider.getPool();
//     console.log(lendingPoolAddress);

//     const lendingPool = new ethers.Contract(
//         lendingPoolAddress,
//         LendingPool.abi,
//         signer
//     );
//     console.log("Lending Pool address: " + lendingPool.address);
//     return lendingPool.address;
// }

export async function getDAIBalance(_account) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const daiToken = new ethers.Contract(
        "0xBa8DCeD3512925e52FE67b1b5329187589072A55",
        ERC20.abi,
        signer
    );

    const balance = await daiToken.balanceOf(_account);
    console.log("Balance DAI in wallet: " + ethers.utils.formatEther(balance));
    return ethers.utils.formatEther(balance);
}

export async function getReserveData(_lendingPool) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //const reserveAddress = await getLendingPool();
    const lendingPool = new ethers.Contract(
        _lendingPool,
        LendingPool.abi,
        signer
    );

    const reserveData = await lendingPool.getReserveData(
        "0xBa8DCeD3512925e52FE67b1b5329187589072A55" //DAI
    );

    return (reserveData.currentLiquidityRate / 10 ** 27) * 100;
}

async function approveERC20(_lendingPool, _amount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const erc20Token = new ethers.Contract(
        "0xBa8DCeD3512925e52FE67b1b5329187589072A55", //DAI
        ERC20.abi,
        signer
    );
    const tx = await erc20Token.approve(_lendingPool, _amount);
    await tx.wait(1);
    console.log(`Approved!`);
}

export async function getBorrowerData(_account, _lendingPool) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //const reserveAddress = await getLendingPool();
    const signer = provider.getSigner();
    const lendingPool = new ethers.Contract(
        _lendingPool,
        LendingPool.abi,
        signer
    );

    const { totalCollateralBase } = await lendingPool.getUserAccountData(
        _account
    ); //in 8dp due to base currency of USD

    console.log(
        `Total value of DAI Collatoral: 
            ${ethers.utils.formatUnits(totalCollateralBase.toString(), 8)}`
    );

    return ethers.utils.formatUnits(totalCollateralBase.toString(), 8);
}

//_amount is already in correct decimal places. 18dp
export async function deposit(_amount, _account, _lendingPool) {
    try {
        const approve = await approveERC20(_lendingPool, _amount);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const lendingPool = new ethers.Contract(
            _lendingPool,
            LendingPool.abi,
            signer
        );
        const deposit = await lendingPool.deposit(
            "0xBa8DCeD3512925e52FE67b1b5329187589072A55", //DAI
            _amount,
            _account,
            0
        );
        await deposit.wait(1);
        console.log(`Deposited  ${ethers.utils.formatEther(_amount)} DAI`);
    } catch (error) {
        console.log(error);
    }
}

//18dp
export async function withdraw(_amount, _account, _lendingPool) {
    try {
        //const approve = await approveERC20(_lendingPool, _amount);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const lendingPool = new ethers.Contract(
            _lendingPool,
            LendingPool.abi,
            signer
        );
        const wtihdraw = await lendingPool.withdraw(
            "0xBa8DCeD3512925e52FE67b1b5329187589072A55",
            _amount,
            _account
        );
        await wtihdraw.wait(1);
        console.log(`Withdrawn  ${ethers.utils.formatEther(_amount)} DAI`);
    } catch (error) {
        console.log(error);
    }
}
