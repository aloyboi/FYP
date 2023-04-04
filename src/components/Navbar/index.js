import ScrollSpyMenu from "../../common/components/ScrollSpyMenu";
import Scrollspy from "react-scrollspy";
import AnchorLink from "react-anchor-link-smooth-scroll";
import { Icon } from "react-icons-kit";
import { menu } from "react-icons-kit/feather/menu";
import { x } from "react-icons-kit/feather/x";
import Logo from "../../common/components/UIElements/Logo";
import Button from "../../common/components/Button";
import Container from "../../common/components/UI/Container";
import NavbarWrapper, { MenuArea, MobileMenu } from "./navbar.style";
import * as md from "react-icons/md";
import LogoImage from "../../common/assets/image/cryptoModern/logo-white.png";
import LogoImageAlt from "../../common/assets/image/cryptoModern/logo.png";
import { navbar } from "../../common/data/CryptoModern";
import LendingPlatform from "../LendingPlatform";
import { Tooltip } from "@mui/material";
import B from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import Avatar from "@mui/material/Avatar";
import * as fc from "react-icons/fc";
import * as io from "react-icons/io";
import {
    Card,
    Popper,
    Tabs,
    Tab,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
} from "@mui/material";
import { aDAIData } from "./data";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    SET_ACCOUNT,
    SET_DEPOSIT_AMOUNT,
    SET_TAB_VALUE,
    SET_INTEREST_RATE,
    LOG_MESSAGE,
    IS_MESSAGE_DISPLAY,
    SET_CURR_AGAINST_TOKEN,
    SET_CURR_REF_TOKEN,
    SET_ROWS_BUY_GLOBALORDER,
    SET_ROWS_SELL_GLOBALORDER,
    SET_USER_BUY_ORDERS,
    SET_USER_FILLED_ORDERS,
    SET_USER_SELL_ORDERS,
} from "../../redux/redux-actions/actions";
import {
    getBorrowerData,
    getReserveData,
    deposit,
    withdraw,
} from "../../scripts/aaveLend";
import {
    getBalance,
    getBalanceInMetamask,
    depositETH,
    depositToken,
    withdrawETH,
    withdrawToken,
} from "../../scripts/functions";

import { ethers } from "ethers";
import { textColor } from "styled-system";

//const lendingPool = process.env.REACT_APP_LENDINGPOOLADDRESSV2;
const lendingPool = process.env.REACT_APP_LENDINGPOOLADDRESSV3;

const Navbar = () => {
    const curr = useSelector((state) => state.account.address);

    const [currentAccount, setCurrentAccount] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [tabValue, setTabValue] = useState("0");
    const [walletTab, setWalletTab] = useState(false);
    const [tokensTab, setTokensTab] = useState("0");
    const [aDAIBalance, setADAIBalance] = useState(0);
    const [actionState, setActionState] = useState("Withdraw");
    const [selectedToken, setSelectedToken] = useState(0);
    const [amount, setAmount] = useState(0);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [tokenLockedBalance, setTokenLockedBalance] = useState(0);
    const [textFieldError, setTextFieldError] = useState(false);
    const [textFieldHtext, setTextFieldHtext] = useState("");
    const allTokens = useSelector((state) => state.token.all_tokens);

    const dispatch = useDispatch();

    const handlePopperClick = (event) => {
        setAnchorEl(event.currentTarget);
        setWalletTab(!walletTab);
    };

    const handleActionToggle = () => {
        if (actionState === "Withdraw") {
            setActionState("Deposit");
        } else {
            setActionState("Withdraw");
        }
    };

    const handleAmountChange = (event) => {
        validateInputs(event.target.value);
    };

    const handleSelect = async (event) => {
        setSelectedToken(event.target.value);
        await getBal(event.target.value);
    };

    const getDeposit = async (account) => {
        const totalCollateralDAI = await getBorrowerData(account, lendingPool);
        dispatch({ type: SET_DEPOSIT_AMOUNT, payload: totalCollateralDAI });
    };

    async function getBal(value) {
        if (curr != null) {
            if (tokensTab === "0") {
                const { balance, locked } = await getBalance(
                    allTokens[value].address,
                    allTokens[value].decimals
                );
                console.log("balance: " + balance);
                console.log("locked: " + locked);
                setTokenBalance(balance);
                setTokenLockedBalance(locked);
                return balance;
            } else {
                const { balance } = await getBalance(
                    aDAIData.tokens[0].address,
                    aDAIData.tokens[0].decimals
                );
                setADAIBalance(balance);
                return balance;
            }
        }
    }

    const displayTempMessage = (message) => {
        dispatch({
            type: LOG_MESSAGE,
            payload: message,
        });
        dispatch({
            type: IS_MESSAGE_DISPLAY,
            payload: true,
        });
        setTimeout(() => {
            dispatch({
                type: LOG_MESSAGE,
                payload: "",
            });
            dispatch({
                type: IS_MESSAGE_DISPLAY,
                payload: false,
            });
        }, 2000);
    };

    function toFixed(num, fixed) {
        var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
        return num.toString().match(re)[0];
    }

    const validateInputs = (number) => {
        if (number === 0 || number === "") {
            setAmount(0);
            return;
        }

        const letterRegex = /^\d*\.?\d*$/;
        //test for letters
        if (!letterRegex.test(number)) {
            setTextFieldError(true);
            setTextFieldHtext("Please enter valid numbers only");
            // turn off error after 2 seconds
            setTimeout(() => {
                setTextFieldError(false);
                setTextFieldHtext("");
            }, 2000);
            return;
        }

        // ignore the '.' and '0' at the end of the string
        let charNum = number.toString();
        const lastChar = charNum[charNum.length - 1];
        const firstChar = charNum[0];
        const secondChar = charNum[1];
        if (lastChar === ".") {
            setTextFieldError(false);
            setTextFieldHtext("");
            setAmount(number);
            return;
        }
        // if (lastChar === "0") {
        //     setTextFieldError(false);
        //     setTextFieldHtext("");
        //     setAmount(number);
        //     return;
        // }
        if (firstChar === "0" && secondChar !== ".") {
            setTextFieldError(false);
            setTextFieldHtext("");
            number = number.substring(1);
            setAmount(number);
            return;
        }

        if (tokensTab === "0") {
            let tokenDecimal = allTokens[selectedToken].decimals;
            if (tokenDecimal == 18) {
                let regex = /^(?!0\d|$)\d*(\.\d{0,18})?$/;
                if (!regex.test(number)) {
                    setTextFieldError(true);
                    setTextFieldHtext("Up to 18 decimal places");
                    setTimeout(() => {
                        setTextFieldError(false);
                        setTextFieldHtext("");
                    }, 2000);
                    number = toFixed(number, 18);
                    setAmount(number);
                    return;
                } else {
                    setTextFieldHtext("");
                    setTextFieldError(false);
                    setAmount(number);
                    return;
                }
            } else if (tokenDecimal == 6) {
                let regex = /^(?!0\d|$)\d*(\.\d{0,6})?$/;
                if (!regex.test(number)) {
                    setTextFieldError(true);
                    setTextFieldHtext("Up to 6 decimal places");
                    setTimeout(() => {
                        setTextFieldError(false);
                        setTextFieldHtext("");
                    }, 2000);
                    number = toFixed(number, 6);
                    setAmount(number);
                    return;
                } else {
                    setTextFieldHtext("");
                    setTextFieldError(false);
                    setAmount(number);
                    return;
                }
            }
        } else {
            let regex = /^(?!0\d|$)\d*(\.\d{0,18})?$/;
            if (!regex.test(number)) {
                setTextFieldError(true);
                setTextFieldHtext("Up to 18 decimal places");
                setTimeout(() => {
                    setTextFieldError(false);
                    setTextFieldHtext("");
                }, 2000);
                number = toFixed(number, 18);
                setAmount(number);
                return;
            } else {
                setTextFieldHtext("");
                setTextFieldError(false);
                setAmount(number);
                return;
            }
        }
    };

    const validateSubmit = async () => {
        if (amount == 0 || amount == "") {
            displayTempMessage("Please enter an amount");
            return false;
        }

        if (actionState === "Withdraw") {
            if (
                tokensTab === "0" &&
                parseFloat(amount) >
                    parseFloat(tokenBalance) - parseFloat(tokenLockedBalance)
            ) {
                displayTempMessage(
                    "Insufficient Balance to Withdraw from Exchange"
                );
                return false;
            } else if (
                tokensTab === "1" &&
                parseFloat(amount) > parseFloat(aDAIBalance)
            ) {
                displayTempMessage(
                    "Insufficient aDAI Balance to Withdraw from Exchange"
                );
                return false;
            } else return true;
        }

        if (actionState === "Deposit") {
            let balanceInMetamask;
            if (tokensTab === "0") {
                balanceInMetamask = await getBalanceInMetamask(
                    curr,
                    allTokens[selectedToken].address,
                    allTokens[selectedToken].decimals,
                    allTokens[selectedToken].symbol
                );
            } else {
                console.log();
                balanceInMetamask = await getBalanceInMetamask(
                    curr,
                    aDAIData.tokens[0].address,
                    aDAIData.tokens[0].decimals,
                    aDAIData.tokens[0].symbol
                );
                console.log("balance in Metamask: " + balanceInMetamask);
            }

            if (parseFloat(amount) > parseFloat(balanceInMetamask)) {
                displayTempMessage(
                    "Insufficient Balance to Deposit from Metamask"
                );
                return false;
            } else {
                return true;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        const answer = await validateSubmit();

        if (!answer) {
            return;
        }

        if (actionState === "Deposit") {
            if (tokensTab === "0") {
                displayTempMessage("Deposit Process");
                if (allTokens[selectedToken].symbol === "ETH") {
                    depositETH(
                        amount,
                        (e) => {
                            getBal(selectedToken);
                            displayTempMessage("Deposit Successful");
                        },
                        displayTempMessage
                    );
                    getBal(selectedToken);
                    setAmount(0);
                } else {
                    depositToken(
                        allTokens[selectedToken].address,
                        amount,
                        allTokens[selectedToken].decimals,
                        (e) => {
                            getBal(selectedToken);
                            displayTempMessage("Deposit Successful");
                        },
                        displayTempMessage,
                        (e) => {
                            displayTempMessage(
                                "User approved token access, now attempting to transfer tokens...."
                            );
                        }
                    );
                    getBal(selectedToken);
                    setAmount(0);
                }
            } else {
                depositToken(
                    aDAIData.tokens[0].address,
                    amount,
                    aDAIData.tokens[0].decimals,
                    (e) => {
                        getBal(selectedToken);
                        displayTempMessage("Deposit aDAI Successful");
                    },
                    displayTempMessage,
                    (e) => {
                        displayTempMessage(
                            "User approved token access, now attempting to transfer tokens...."
                        );
                    }
                );
                getBal(selectedToken);
                setAmount(0);
            }
        } else {
            if (tokensTab === "0") {
                displayTempMessage("Withdraw Process");
                if (allTokens[selectedToken].symbol === "ETH") {
                    withdrawETH(
                        amount,
                        (e) => {
                            getBal(selectedToken);
                            displayTempMessage("Withdraw Successful");
                        },
                        displayTempMessage
                    );
                    getBal(selectedToken);
                    setAmount(0);
                } else {
                    withdrawToken(
                        allTokens[selectedToken].address,
                        amount,
                        allTokens[selectedToken].decimals,
                        (e) => {
                            getBal(selectedToken);
                            displayTempMessage("Withdraw Successful");
                        },
                        displayTempMessage
                    );
                    getBal(selectedToken);
                    setAmount(0);
                }
            } else {
                withdrawToken(
                    aDAIData.tokens[0].address,
                    amount,
                    aDAIData.tokens[0].decimals,
                    (e) => {
                        getBal(selectedToken);
                        displayTempMessage("Withdrawal of aDAi Successful");
                    },
                    displayTempMessage
                );
                getBal(selectedToken);
                setAmount(0);
            }
        }
    };

    const checkIfAccountChanged = () => {
        try {
            window.ethereum.on("accountsChanged", (account) => {
                if (account.length > 0) {
                    dispatch({ type: SET_ACCOUNT, payload: account[0] });
                    setCurrentAccount(account[0]);
                    getDeposit(account[0]);
                    dispatch({ type: SET_USER_BUY_ORDERS, payload: [] });
                    dispatch({ type: SET_USER_SELL_ORDERS, payload: [] });
                    dispatch({ type: SET_USER_FILLED_ORDERS, payload: [] });
                } else {
                    dispatch({ type: SET_ACCOUNT, payload: null });
                    dispatch({ type: SET_DEPOSIT_AMOUNT, payload: 0 });
                    dispatch({ type: SET_INTEREST_RATE, payload: 0 });
                    setCurrentAccount("");
                    dispatch({ type: SET_USER_BUY_ORDERS, payload: [] });
                    dispatch({ type: SET_USER_SELL_ORDERS, payload: [] });
                    dispatch({ type: SET_USER_FILLED_ORDERS, payload: [] });
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                dispatch({
                    type: SET_ACCOUNT,
                    payload: window.ethereum.selectedAddress,
                });
                setCurrentAccount(window.ethereum.selectedAddress);
                getDeposit(window.ethereum.selectedAddress);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleTabChange = (event, newValue) => {
        dispatch({ type: SET_TAB_VALUE, payload: newValue });
        setTabValue(newValue);
        setWalletTab(false);
    };

    const handleTokensTabChange = (event, newValue) => {
        setTokensTab(newValue);
        getBal(selectedToken);
    };

    useEffect(() => {
        if (curr != null) {
            getBal(selectedToken);
        }

        checkIfAccountChanged();
    }, [curr]);

    const clickHandler = () => {
        if (currentAccount === "") {
            connectWallet();
        }
    };

    return (
        <NavbarWrapper className="navbar">
            <Container>
                <Logo
                    href="/"
                    // logoSrc={LogoImage}
                    title="lenDEXchange"
                    className="main-logo"
                />
                <MenuArea style={{ position: "fixed", marginLeft: "270px" }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ height: "40px" }}
                    >
                        <Tab label="Home" value="0" sx={{ color: "grey" }} />
                        <Tab
                            label="Decentralized Exchange"
                            value="1"
                            sx={{ color: "grey" }}
                        />
                        <Tab
                            label="Lending Platform"
                            value="2"
                            sx={{ color: "grey" }}
                        />
                    </Tabs>
                </MenuArea>
                <MenuArea
                    style={{
                        position: "fixed",
                        marginLeft: "750px",
                    }}
                >
                    {tabValue === "1" && curr != null ? (
                        <div
                            style={{
                                display: "flex",
                                marginLeft: "60px",
                                zIndex: 1,
                            }}
                        >
                            <Tooltip
                                placement="left"
                                arrow
                                sx={{
                                    marginRight: 0,
                                    marginLeft: "auto",
                                }}
                            >
                                <B
                                    aria-describedby={"transition-popper"}
                                    type="button"
                                    onClick={handlePopperClick}
                                >
                                    <md.MdOutlineAccountBalanceWallet
                                        size={40}
                                        color="#fff"
                                    ></md.MdOutlineAccountBalanceWallet>
                                </B>
                            </Tooltip>
                            <Popper
                                id={"transition-popper"}
                                open={walletTab}
                                anchorEl={anchorEl}
                                transition
                                sx={{ marginTop: "100px" }}
                            >
                                {({ TransitionProps }) => (
                                    <Fade {...TransitionProps} timeout={350}>
                                        <Card
                                            sx={{
                                                width: "500px",
                                                height: "500px",
                                                zIndex: "9999 !important",
                                                backgroundColor: "#131823",
                                                borderRadius: "30px",
                                                display: "flex",
                                                marginTop: "50px",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                }}
                                            >
                                                <Card
                                                    sx={{
                                                        width: "100%",
                                                        backgroundColor:
                                                            "rgb(21,33,73)",
                                                        display: "flex",
                                                        padding: "10px",
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Card
                                                        sx={{
                                                            backgroundColor:
                                                                "#131824",
                                                            display: "flex",
                                                            padding: "10px",
                                                            borderRadius:
                                                                "10px",
                                                            width: "60%",
                                                            justifyContent:
                                                                "center",
                                                            marginRight: "5px",
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                color: "#fff",
                                                                marginLeft:
                                                                    "5px",
                                                                borderRadius:
                                                                    "10px",
                                                                fontSize:
                                                                    "20px",
                                                            }}
                                                        >
                                                            {curr
                                                                ? "Goerli Test Network"
                                                                : "No account connected"}
                                                        </Typography>
                                                    </Card>
                                                    <Card
                                                        sx={{
                                                            backgroundColor:
                                                                "#131824",
                                                            display: "flex",
                                                            padding: "10px",
                                                            borderRadius:
                                                                "10px",
                                                            marginLeft: "auto",
                                                            marginRight: "0",
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                marginTop:
                                                                    "0px",
                                                                height: "30px",
                                                                width: "30px",
                                                            }}
                                                        ></Avatar>
                                                    </Card>
                                                </Card>
                                            </div>
                                            <B
                                                sx={{
                                                    marginLeft: "-350px",
                                                    // marginRight: "auto",
                                                    marginTop: "10px",
                                                }}
                                                onClick={handleActionToggle}
                                            >
                                                <fc.FcRefresh
                                                    style={{
                                                        marginRight: "5px",
                                                    }}
                                                ></fc.FcRefresh>
                                                {actionState === "Withdraw"
                                                    ? "Deposit"
                                                    : "Withdraw"}
                                            </B>
                                            <Tabs
                                                value={tokensTab}
                                                onChange={handleTokensTabChange}
                                                sx={{
                                                    position: "fixed",
                                                    marginLeft: "200px",
                                                    marginTop: "70px",
                                                }}
                                            >
                                                <Tab label="Tokens" value="0" />
                                                <Tab label="aDAI" value="1" />
                                            </Tabs>
                                            {tokensTab === "0" ? (
                                                <div>
                                                    <Card
                                                        sx={{
                                                            height: "180px",
                                                            backgroundColor:
                                                                "#152149",
                                                            width: "450px",
                                                            marginTop: "10px",
                                                            borderRadius:
                                                                "10px",
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            flexDirection:
                                                                "column",
                                                            paddingLeft: "10px",
                                                            paddingRight:
                                                                "10px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontSize:
                                                                        "12px !important",
                                                                    color: "#6c86ad !important",
                                                                    marginTop:
                                                                        "5px",
                                                                    padding:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {actionState}
                                                            </Typography>
                                                        </div>
                                                        <div
                                                            style={{
                                                                height: "60px",
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: "30%",
                                                                }}
                                                            >
                                                                <FormControl
                                                                    fullWidth
                                                                >
                                                                    <InputLabel id="demo-simple-select-label">
                                                                        Token
                                                                    </InputLabel>
                                                                    <Select
                                                                        labelId="demo-simple-select-label"
                                                                        id="demo-simple-select"
                                                                        value={
                                                                            selectedToken
                                                                        }
                                                                        label="sell token"
                                                                        onChange={
                                                                            handleSelect
                                                                        }
                                                                        sx={{
                                                                            color: "white",
                                                                        }}
                                                                    >
                                                                        {allTokens
                                                                            ? allTokens.map(
                                                                                  (
                                                                                      item,
                                                                                      index
                                                                                  ) => {
                                                                                      return (
                                                                                          <MenuItem
                                                                                              value={
                                                                                                  index
                                                                                              }
                                                                                          >
                                                                                              <img
                                                                                                  alt=""
                                                                                                  src={
                                                                                                      item.logoURI
                                                                                                  }
                                                                                                  style={{
                                                                                                      width: "20px",
                                                                                                      height: "20px",
                                                                                                      marginRight:
                                                                                                          "10px",
                                                                                                      marginBottom:
                                                                                                          "-4px",
                                                                                                  }}
                                                                                              ></img>
                                                                                              {
                                                                                                  item.symbol
                                                                                              }
                                                                                          </MenuItem>
                                                                                      );
                                                                                  }
                                                                              )
                                                                            : null}
                                                                    </Select>
                                                                </FormControl>
                                                            </Box>
                                                            <TextField
                                                                error={
                                                                    textFieldError
                                                                }
                                                                defaultValue={0}
                                                                sx={{
                                                                    width: "70%",
                                                                    marginLeft:
                                                                        "10px",
                                                                    color: "white !important",
                                                                }}
                                                                onChange={
                                                                    handleAmountChange
                                                                }
                                                                onBlur={
                                                                    handleAmountChange
                                                                }
                                                                value={amount}
                                                                helperText={
                                                                    textFieldHtext
                                                                }
                                                                label={
                                                                    textFieldError
                                                                        ? "Error"
                                                                        : undefined
                                                                }
                                                                id={
                                                                    "outlined-error-helper-text"
                                                                }
                                                            ></TextField>
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontSize:
                                                                        "12px !important",
                                                                    color: "#6c86ad !important",
                                                                    padding:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {allTokens
                                                                    ? allTokens[
                                                                          selectedToken
                                                                      ].name
                                                                    : null}
                                                            </Typography>
                                                            {/* <Typography sx={{ fontSize: "15px !important", color: "#6c86ad !important", marginLeft: 'auto', marginRight: '0' }}>~$10</Typography> */}
                                                        </div>
                                                        <B
                                                            onClick={
                                                                handleSubmit
                                                            }
                                                            sx={{
                                                                background:
                                                                    "linear-gradient(to right,#4ba1d8,#4464e0 95%) !important",
                                                                color: "white",
                                                                borderRadius:
                                                                    "13px",
                                                                marginBottom:
                                                                    "15px",
                                                            }}
                                                        >
                                                            {actionState}
                                                        </B>
                                                    </Card>

                                                    <Card
                                                        sx={{
                                                            height: "160px",
                                                            backgroundColor:
                                                                "#152149",
                                                            width: "450px",
                                                            marginTop: "20px",
                                                            borderRadius:
                                                                "10px",
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            flexDirection:
                                                                "column",
                                                            paddingLeft: "10px",
                                                            paddingRight:
                                                                "10px",
                                                        }}
                                                    >
                                                        <B
                                                            sx={{
                                                                marginLeft:
                                                                    "auto",
                                                                marginRight:
                                                                    "0",
                                                                padding:
                                                                    "0 0 4px 0",
                                                            }}
                                                            onClick={() => {
                                                                getBal(
                                                                    selectedToken
                                                                );
                                                            }}
                                                        >
                                                            <io.IoIosRefresh
                                                                style={{
                                                                    marginRight:
                                                                        "5px",
                                                                }}
                                                                size={20}
                                                            ></io.IoIosRefresh>
                                                            refresh amt
                                                        </B>
                                                        <Typography
                                                            color="white"
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            Total{" "}
                                                            {allTokens
                                                                ? allTokens[
                                                                      selectedToken
                                                                  ].symbol
                                                                : null}{" "}
                                                            Owned:
                                                            <Card
                                                                sx={{
                                                                    backgroundColor:
                                                                        "#6c86ad",
                                                                    height: "50px",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    width: "210px",
                                                                    marginLeft:
                                                                        "auto",
                                                                    fontSize:
                                                                        "35px",
                                                                    paddingRight:
                                                                        "5px",
                                                                    textAlign:
                                                                        "end",
                                                                    marginRight:
                                                                        "0",
                                                                    color: "white",
                                                                }}
                                                            >
                                                                {tokenBalance}
                                                            </Card>
                                                        </Typography>
                                                        <Typography
                                                            color="white"
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                                alignItems:
                                                                    "center",
                                                                marginTop:
                                                                    "10px",
                                                            }}
                                                        >
                                                            Total{" "}
                                                            {allTokens
                                                                ? allTokens[
                                                                      selectedToken
                                                                  ].symbol
                                                                : null}{" "}
                                                            Locked:
                                                            <Card
                                                                sx={{
                                                                    backgroundColor:
                                                                        "#6c86ad",
                                                                    height: "50px",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    width: "210px",
                                                                    marginLeft:
                                                                        "auto",
                                                                    fontSize:
                                                                        "35px",
                                                                    paddingRight:
                                                                        "5px",
                                                                    textAlign:
                                                                        "end",
                                                                    marginRight:
                                                                        "0",
                                                                    color: "white",
                                                                }}
                                                            >
                                                                {
                                                                    tokenLockedBalance
                                                                }
                                                            </Card>
                                                        </Typography>
                                                    </Card>
                                                </div>
                                            ) : (
                                                //here onwards for ADAI
                                                <div>
                                                    <Card
                                                        sx={{
                                                            height: "180px",
                                                            backgroundColor:
                                                                "#152149",
                                                            width: "450px",
                                                            marginTop: "10px",
                                                            borderRadius:
                                                                "10px",
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            flexDirection:
                                                                "column",
                                                            paddingLeft: "10px",
                                                            paddingRight:
                                                                "10px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontSize:
                                                                        "12px !important",
                                                                    color: "#6c86ad !important",
                                                                    marginTop:
                                                                        "5px",
                                                                    padding:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {actionState}
                                                            </Typography>
                                                        </div>
                                                        <div
                                                            style={{
                                                                height: "60px",
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: "30%",
                                                                }}
                                                            >
                                                                <FormControl
                                                                    fullWidth
                                                                >
                                                                    <Card
                                                                        sx={{
                                                                            backgroundColor:
                                                                                "#131824",
                                                                            display:
                                                                                "flex",
                                                                            padding:
                                                                                "10px",
                                                                            borderRadius:
                                                                                "10px",
                                                                            marginLeft:
                                                                                "auto",
                                                                            marginRight:
                                                                                "0",
                                                                            width: "100%",
                                                                            textColor:
                                                                                "white",
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            src={
                                                                                aDAIData
                                                                                    .tokens[0]
                                                                                    .logoURI
                                                                            }
                                                                            sx={{
                                                                                marginTop:
                                                                                    "5px",
                                                                                height: "30px",
                                                                                width: "30px",
                                                                            }}
                                                                        ></Avatar>
                                                                        <Card
                                                                            sx={{
                                                                                height: "30px",
                                                                                backgroundColor:
                                                                                    "#152149",
                                                                                width: "100%",
                                                                                marginTop:
                                                                                    "5px",
                                                                                marginLeft:
                                                                                    "5px",
                                                                                borderRadius:
                                                                                    "10px",
                                                                                display:
                                                                                    "flex",
                                                                                justifyContent:
                                                                                    "center",
                                                                                flexDirection:
                                                                                    "column",
                                                                                paddingLeft:
                                                                                    "10px",
                                                                                paddingRight:
                                                                                    "10px",
                                                                                color: "white",
                                                                            }}
                                                                        >
                                                                            aDAI
                                                                        </Card>
                                                                    </Card>
                                                                </FormControl>
                                                            </Box>
                                                            <TextField
                                                                error={
                                                                    textFieldError
                                                                }
                                                                defaultValue={0}
                                                                sx={{
                                                                    width: "70%",
                                                                    marginLeft:
                                                                        "10px",
                                                                    color: "white !important",
                                                                }}
                                                                onChange={
                                                                    handleAmountChange
                                                                }
                                                                onBlur={
                                                                    handleAmountChange
                                                                }
                                                                value={amount}
                                                                helperText={
                                                                    textFieldHtext
                                                                }
                                                                label={
                                                                    textFieldError
                                                                        ? "Error"
                                                                        : undefined
                                                                }
                                                                id={
                                                                    "outlined-error-helper-text"
                                                                }
                                                            ></TextField>
                                                        </div>

                                                        <B
                                                            onClick={
                                                                handleSubmit
                                                            }
                                                            sx={{
                                                                background:
                                                                    "linear-gradient(to right,#4ba1d8,#4464e0 95%) !important",
                                                                color: "white",
                                                                borderRadius:
                                                                    "13px",
                                                                marginBottom:
                                                                    "15px",
                                                                marginTop:
                                                                    "20px",
                                                            }}
                                                        >
                                                            {actionState}
                                                        </B>
                                                    </Card>

                                                    <Card
                                                        sx={{
                                                            height: "100px",
                                                            backgroundColor:
                                                                "#152149",
                                                            width: "450px",
                                                            marginTop: "20px",
                                                            borderRadius:
                                                                "10px",
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            flexDirection:
                                                                "column",
                                                            paddingLeft: "10px",
                                                            paddingRight:
                                                                "10px",
                                                        }}
                                                    >
                                                        <B
                                                            sx={{
                                                                marginLeft:
                                                                    "auto",
                                                                marginRight:
                                                                    "0",
                                                                padding:
                                                                    "0 0 4px 0",
                                                            }}
                                                            onClick={() => {
                                                                getBal(
                                                                    selectedToken
                                                                );
                                                            }}
                                                        >
                                                            <io.IoIosRefresh
                                                                style={{
                                                                    marginRight:
                                                                        "5px",
                                                                }}
                                                                size={20}
                                                            ></io.IoIosRefresh>
                                                            refresh amt
                                                        </B>
                                                        <Typography
                                                            color="white"
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "row",
                                                                alignItems:
                                                                    "center",
                                                                marginLeft:
                                                                    "20px",
                                                            }}
                                                        >
                                                            aDAI Token balance:
                                                            <Card
                                                                sx={{
                                                                    backgroundColor:
                                                                        "#6c86ad",
                                                                    height: "50px",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    width: "210px",
                                                                    marginLeft:
                                                                        "auto",
                                                                    fontSize:
                                                                        "35px",
                                                                    paddingRight:
                                                                        "5px",
                                                                    textAlign:
                                                                        "end",
                                                                    marginRight:
                                                                        "0",
                                                                    color: "white",
                                                                }}
                                                            >
                                                                {aDAIBalance}
                                                            </Card>
                                                        </Typography>
                                                    </Card>
                                                </div>
                                            )}
                                        </Card>
                                    </Fade>
                                )}
                            </Popper>
                        </div>
                    ) : null}
                </MenuArea>

                <MenuArea style={{ position: "fixed", marginLeft: "900px" }}>
                    <Button
                        className="trail"
                        title={currentAccount || "Connect Wallet"}
                        type="button"
                        onClick={clickHandler}
                    ></Button>
                </MenuArea>
            </Container>
        </NavbarWrapper>
    );
};

export default Navbar;
