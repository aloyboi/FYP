import DexExchangeContainer from "./dex.style";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import React from "react";
import { data } from "./data";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Fab from "@mui/material/Fab";
// import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useDispatch, useSelector } from "react-redux";
import "./dex.css";
import { marginTop } from "styled-system";
import { SET_BUY_SELL_TAB } from "../../redux/redux-actions/actions";

const DexExchange = () => {
    //Selectors
    const buySellTokens = useSelector(
        (state) => state.tabValue.buySellSelected
    );
    //const selectMessage = (state) => state.message.message;
    const curr = useSelector((state) => state.account.address);

    const [buySellSelected, setBuySellSelected] = useState(0);
    const [buySelected, setBuySelected] = useState(0);
    const [sellSelected, setSellSelected] = useState(0);
    // const [buyTextFieldError, setBuyTextFieldError] = useState(false);
    // const [buyTextFieldHtext, setBuyTextFieldHtext] = useState("");
    // const [sellTextFieldError, setSellTextFieldError] = useState(false);
    // const [sellTextFieldHtext, setSellTextFieldHtext] = useState("");

    const [buyAmount, setBuyAmount] = useState(0);
    const [sellAmount, setSellAmount] = useState(0);
    const [rate, setRate] = useState(0);
    //true = controlling sell rate
    const [rateState, setRateState] = useState(false);
    const [buyBalance, setBuyBalance] = useState(0);
    const [sellBalance, setSellBalance] = useState(0);
    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);
    const [newTokenAddress, setNewTokenAddress] = React.useState("");
    const adminAcc = process.env.REACT_APP_ADMIN_ADDRESS;

    // function toFixed(num, fixed) {
    //     var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
    //     return num.toString().match(re)[0];
    // }

    const handleBuySelectChange = (event) => {
        setBuySelected(event.target.value);
        checkEqual("buy", event.target.value);
    };

    const handleBuySellSelectedChange = (event, newValue) => {
        dispatch({ type: SET_BUY_SELL_TAB, payload: newValue });
        setBuySellSelected(newValue);
    };

    const getSellBalance = async (target) => {
        let sel = sellSelected;
        if (typeof target !== "undefined") {
            sel = target;
        }
        await getBalance(sellTokens[sel].address, (balance, locked) => {
            setSellBalance(balance - locked);
        });
    };

    const handleSellSelectChange = (event) => {
        setSellSelected(event.target.value);
        dispatch({
            type: SET_CURR_SELECTED_TOKEN,
            payload: sellTokens[event.target.value],
        });
        checkEqual("sell", event.target.value);
        getSellBalance(event.target.value);
    };

    // const dispatchSnackBar = (message) => {
    //     dispatch({
    //         type: LOG_MESSAGE,
    //         payload: message,
    //     });
    // };

    // const dispatchSnackBarDisplay = (isDisplay) => {
    //     dispatch({
    //         type: IS_MESSAGE_DISPLAY,
    //         payload: isDisplay,
    //     });
    // };

    // const handleRateStateToggle = (event) => {
    //     event.preventDefault();
    //     setRateState(!rateState);
    //     setRate(1 / rate);
    // };

    // const handleSellAmountChange = (e) => {
    //     validateSellAmount(e.target.value);
    // };

    // const validateBuyAmount = (amt) => {
    //     let number = amt;
    //     const regex = /^(?!0\d|$)\d*(\.\d{1,6})?$/;
    //     const letterRegex = /^\d*\.?\d*$/;
    //     if (number === "") {
    //         setBuyAmount(0);
    //         return;
    //     }
    //     //test for letters
    //     if (!letterRegex.test(number)) {
    //         setBuyTextFieldError(true);
    //         setBuyTextFieldHtext("Please enter valid numbers only");
    //         // turn off error after 2 seconds
    //         setTimeout(() => {
    //             setBuyTextFieldError(false);
    //             setBuyTextFieldHtext("");
    //         }, 2000);
    //         return;
    //     }
    //     // ignore the '.' and '0' at the end of the string
    //     const lastChar = number[number.length - 1];
    //     if (lastChar === ".") {
    //         setBuyTextFieldError(false);
    //         setBuyTextFieldHtext("");

    //         setBuyAmount(number);
    //         return;
    //     }
    //     if (lastChar === "0") {
    //         setBuyTextFieldError(false);
    //         setBuyTextFieldHtext("");
    //         setBuyAmount(number);
    //         if (rateState) {
    //             setRate(parseFloat((sellAmount / number).toFixed(10)));
    //         } else {
    //             setRate(parseFloat((number / sellAmount).toFixed(10)));
    //         }
    //         return;
    //     }

    //     number = parseFloat(number);

    //     //test for < 6 decimal places
    //     if (regex.test(number)) {
    //         setBuyTextFieldHtext("");
    //         setBuyTextFieldError(false);
    //         setBuyAmount(number);
    //         if (rateState) {
    //             setRate(parseFloat((sellAmount / number).toFixed(10)));
    //         } else {
    //             setRate(parseFloat((number / sellAmount).toFixed(10)));
    //         }
    //     }
    //     //else reduce number to 6 decimal places
    //     else {
    //         setBuyTextFieldError(true);
    //         setBuyTextFieldHtext("Up to 6 decimal places");
    //         setTimeout(() => {
    //             setBuyTextFieldError(false);
    //             setBuyTextFieldHtext("");
    //         }, 2000);
    //         number = toFixed(number, 6);
    //         setBuyAmount(number);
    //         if (rateState) {
    //             setRate(parseFloat((sellAmount / number).toFixed(10)));
    //         } else {
    //             setRate(parseFloat((number / sellAmount).toFixed(10)));
    //         }
    //     }
    // };

    // const validateSellAmount = (amt) => {
    //     let number = amt;
    //     const regex = /^(?!0\d|$)\d*(\.\d{1,18})?$/;

    //     if (number === 0 || number === "") {
    //         setSellAmount(1);
    //         return;
    //     }

    //     // ignore the '.' and '0' at the end of the string
    //     let charNum = number.toString();
    //     const lastChar = charNum[charNum.length - 1];
    //     if (lastChar === ".") {
    //         setSellTextFieldError(false);
    //         setSellTextFieldHtext("");
    //         setSellAmount(number);
    //         return;
    //     }
    //     if (lastChar === "0") {
    //         setSellTextFieldError(false);
    //         setSellTextFieldHtext("");
    //         setSellAmount(number);
    //         if (rateState) {
    //             setBuyAmount(number * rate);
    //         } else {
    //             setBuyAmount(number / rate);
    //         }
    //         return;
    //     }

    //     //test for < 18 decimal places
    //     if (regex.test(number)) {
    //         setSellTextFieldHtext("");
    //         setSellTextFieldError(false);

    //         setSellAmount(number);
    //         if (rateState) {
    //             setBuyAmount(number * rate);
    //         } else {
    //             setBuyAmount(number / rate);
    //         }
    //     }
    //     //else reduce number to 6 decimal places
    //     else {
    //         setSellTextFieldError(true);
    //         setSellTextFieldHtext("Up to 18 decimal places");
    //         setTimeout(() => {
    //             setSellTextFieldError(false);
    //             setSellTextFieldHtext("");
    //         }, 2000);
    //         number = toFixed(number, 18);
    //         setBuyAmount(number);
    //         if (rateState) {
    //             setBuyAmount(number * rate);
    //         } else {
    //             setBuyAmount(number / rate);
    //         }
    //     }
    // };

    // const getBuyBalance = (target) => {
    //     let buy = buySelected;
    //     if (typeof target !== "undefined") {
    //         buy = target;
    //     }
    //     getBalance(buyTokens[buy].address, (balance, locked) => {
    //         setBuyBalance(balance - locked);
    //     });
    // };

    // const handleBuyAmountChange = (e) => {
    //     let number = e.target.value;
    //     validateBuyAmount(number);
    //     getBuyBalance(number);
    // };

    // const handleRateChange = (e) => {
    //     setRate(e.target.value);

    //     if (rateState) {
    //         setBuyAmount(sellAmount / e.target.value);
    //     } else {
    //         setBuyAmount(sellAmount * e.target.value);
    //     }
    // };

    // const checkEqual = (initiater, selected) => {
    //     let btselect;
    //     let stselect;
    //     if (initiater === "buy") {
    //         btselect = selected;
    //         stselect = sellSelected;
    //     } else {
    //         btselect = buySelected;
    //         stselect = selected;
    //     }
    //     if (
    //         buyTokens &&
    //         sellTokens &&
    //         buyTokens[btselect].name === sellTokens[stselect].name
    //     ) {
    //         if (initiater === "buy") {
    //             //shift same token to the end of the array

    //             //make copy of sell tokens
    //             let tempSellTokens = [...sellTokens];
    //             let temp = tempSellTokens[sellSelected];
    //             tempSellTokens.splice(sellSelected, 1);
    //             tempSellTokens.push(temp);
    //             dispatch({ type: SET_SELL_TOKENS, payload: tempSellTokens });
    //             setSellSelected(0);
    //         } else {
    //             let tempBuyTokens = [...buyTokens];
    //             let temp = tempBuyTokens[buySelected];
    //             tempBuyTokens.splice(buySelected, 1);
    //             tempBuyTokens.push(temp);
    //             dispatch({ type: SET_BUY_TOKENS, payload: tempBuyTokens });
    //             setBuySelected(0);
    //         }
    //     }
    // };

    // const addTokens = () => {
    //     setOpen(true);
    // };

    // const handleClose = () => {
    //     setOpen(false);
    // };

    // const handleNewTokenInputChange = (e) => {
    //     setNewTokenAddress(e.target.value);
    // };

    // const handleFinalAddToken = () => {
    //     console.log(newTokenAddress);
    //     addToken(newTokenAddress, (e) => {
    //         console.log(e);
    //     });
    //     setOpen(false);
    // };

    // const displayTempMessage = (message) => {
    //     dispatchSnackBar(message);
    //     dispatchSnackBarDisplay(true);
    //     setTimeout(() => {
    //         dispatchSnackBar("");
    //         dispatchSnackBarDisplay(false);
    //     }, 2000);
    // };
    // const flipAllStates = () => {
    //     // let tempBuyTokens = [...buyTokens];
    //     // let tempSellTokens = [...sellTokens];
    //     // dispatch({ type: SET_BUY_TOKENS, payload: tempSellTokens });
    //     // dispatch({ type: SET_SELL_TOKENS, payload: tempBuyTokens });
    //     // let temp = buySelected;
    //     // setBuySelected(sellSelected);
    //     // setSellSelected(temp);
    //     // temp = buyAmount;
    //     // setBuyAmount(sellAmount);
    //     // setSellAmount(temp);
    //     // setRate(1 / rate);
    //     if (tabValue === 0) {
    //         setTabValue(1);
    //     } else {
    //         setTabValue(0);
    //     }
    // };

    // const handleBuyClick = () => {
    //     if (tabValue === 0) {
    //         createLimitSellOrder(
    //             sellTokens[sellSelected].address,
    //             sellAmount.toString(),
    //             rate.toString(),
    //             (e) => {
    //                 displayTempMessage(e);
    //                 dispatch({ type: INC_ORDER_COUNT });
    //             },
    //             (e) => {
    //                 displayTempMessage(e);
    //                 dispatch({ type: INC_ORDER_COUNT });
    //             },
    //             displayTempMessage
    //         );
    //     } else {
    //         createLimitBuyOrder(
    //             sellTokens[sellSelected].address,
    //             sellAmount.toString(),
    //             rate.toString(),
    //             (e) => {
    //                 displayTempMessage(e);
    //                 dispatch({ type: INC_ORDER_COUNT });
    //             },
    //             (e) => {
    //                 displayTempMessage(e);
    //                 dispatch({ type: INC_ORDER_COUNT });
    //             },
    //             displayTempMessage
    //         );
    //     }
    // };

    // useEffect(() => {
    //     if (sellTokens) {
    //         dispatch({ type: SET_CURR_SELECTED_TOKEN, payload: sellTokens[0] });
    //         getBuyBalance();
    //         getSellBalance();
    //     } else {
    //         dispatch({ type: SET_BUY_TOKENS, payload: data.pegged });
    //         dispatch({ type: SET_SELL_TOKENS, payload: data.tokens });
    //         dispatch({ type: SET_ALL_TOKENS, payload: data.all });
    //         checkEqual("buy", 0);
    //     }

    //     // eslint-disable-next-line
    // }, [sellTokens, message, account]);

    return (
        <DexExchangeContainer>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "500px",
                    typography: "body1",
                    color: "white",
                    backgroundColor: "#152149",
                    borderRadius: "10px",
                    marginTop: "10rem",
                    marginLeft: "30rem",
                }}
            >
                <Tabs
                    value={tabValue}
                    // onChange={handleTabChange}
                    sx={{ height: "40px" }}
                >
                    <Tab label="Sell" />
                    <Tab label="Buy" />
                    {/* {account ? (
                        account.toLowerCase() === adminAcc.toLowerCase() ? (
                            <Tooltip title="Click Here to Add Tokens">
                                <Fab
                                    sx={{
                                        marginLeft: "220px",
                                        marginTop: "15px",
                                        marginRight: "2px",
                                    }}
                                    onClick={addTokens}
                                >
                                    <AddIcon
                                        sx={{ backgroundColor: "black" }}
                                        aria-label="add"
                                    ></AddIcon>
                                </Fab>
                            </Tooltip>
                        ) : null
                    ) : null} */}
                </Tabs>
                <div
                    style={{
                        display: "flex",
                        height: "550px",
                        flexDirection: "column",
                    }}
                >
                    {/* card */}
                    <Card
                        sx={{
                            height: "150px",
                            backgroundColor: "#131823",
                            width: "450px",
                            marginTop: "50px",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography
                                sx={{
                                    fontSize: "15px !important",
                                    color: "#6c86ad !important",
                                }}
                            >
                                Buy/Sell Text Here
                                {/* {tabValue === 0 ? "You Sell" : "You Buy"} */}
                            </Typography>
                            {/*{tabValue === 0 ? (
                                <Typography
                                    sx={{
                                        fontSize: "15px !important",
                                        color: "#6c86ad !important",
                                        marginLeft: "auto",
                                        marginRight: "0",
                                    }}
                                >
                                    Balance: {sellBalance}
                                </Typography>
                            ) : null} */}
                        </div>
                        <div
                            style={{
                                height: "60px",
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <Box sx={{ width: "30%" }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                        Token
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={sellSelected}
                                        label="sell token"
                                        //onChange={handleSellSelectChange}
                                        sx={{ color: "white" }}
                                        onBlur={(e) => {
                                            let num = buyAmount;
                                            validateBuyAmount(num);
                                        }}
                                    >
                                        {/* {sellTokens
                                            ? sellTokens.map((item, index) => {
                                                  return (
                                                      <MenuItem value={index}>
                                                          <img
                                                              alt=""
                                                              src={item.logoURI}
                                                              style={{
                                                                  width: "20px",
                                                                  height: "20px",
                                                                  marginRight:
                                                                      "10px",
                                                                  marginBottom:
                                                                      "-4px",
                                                              }}
                                                          ></img>
                                                          {item.symbol}
                                                      </MenuItem>
                                                  );
                                              })
                                            : null} */}
                                    </Select>
                                </FormControl>
                            </Box>
                            <TextField
                            // defaultValue={1}
                            // type="number"
                            // sx={{
                            //     width: "70%",
                            //     marginLeft: "10px",
                            //     color: "white !important",
                            // }}
                            // onChange={handleSellAmountChange}
                            // value={sellAmount}
                            // onBlur={(e) => {
                            //     let num = buyAmount;
                            //     validateBuyAmount(num);
                            // }}
                            // helperText={sellTextFieldHtext}
                            // label={sellTextFieldError ? "Error" : undefined}
                            // id={"outlined-error-helper-text"}
                            // error={sellTextFieldError}
                            ></TextField>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography
                                sx={{
                                    fontSize: "15px !important",
                                    color: "#6c86ad !important",
                                }}
                            >
                                {/* {sellTokens
                                    ? sellTokens[sellSelected].name
                                    : null} */}
                            </Typography>
                        </div>
                    </Card>

                    {/* <Card
                        sx={{
                            height: "150px",
                            backgroundColor: "#131823",
                            width: "450px",
                            marginTop: "10px",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography
                                sx={{
                                    fontSize: "15px !important",
                                    color: "#6c86ad !important",
                                }}
                            >
                                For
                            </Typography>
                            {tabValue === 1 ? (
                                <Typography
                                    sx={{
                                        fontSize: "15px !important",
                                        color: "#6c86ad !important",
                                        marginLeft: "auto",
                                        marginRight: "0",
                                    }}
                                >
                                    Balance: {buyBalance}
                                </Typography>
                            ) : null}
                        </div>
                        <div
                            style={{
                                height: "60px",
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <Box sx={{ width: "30%" }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                        Token
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={buySelected}
                                        label="Token"
                                        onChange={handleBuySelectChange}
                                        sx={{ color: "white" }}
                                    >
                                        {buyTokens
                                            ? buyTokens.map((item, index) => {
                                                  return (
                                                      <MenuItem value={index}>
                                                          <img
                                                              alt=""
                                                              src={item.logoURI}
                                                              style={{
                                                                  width: "20px",
                                                                  height: "20px",
                                                                  marginRight:
                                                                      "10px",
                                                                  marginBottom:
                                                                      "-4px",
                                                              }}
                                                          ></img>
                                                          {item.symbol}
                                                      </MenuItem>
                                                  );
                                              })
                                            : null}
                                    </Select>
                                </FormControl>
                            </Box>
                            <TextField
                                error={buyTextFieldError}
                                defaultValue={1}
                                sx={{
                                    width: "70%",
                                    marginLeft: "10px",
                                    color: "white !important",
                                }}
                                onChange={handleBuyAmountChange}
                                onBlur={handleBuyAmountChange}
                                value={buyAmount}
                                helperText={buyTextFieldHtext}
                                label={buyTextFieldError ? "Error" : undefined}
                                id={"outlined-error-helper-text"}
                            ></TextField>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            
                        </div>
                    </Card> */}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            marginTop: "10px",
                        }}
                    >
                        {/* <Card
                            sx={{
                                height: "80px",
                                backgroundColor: "#131823",
                                width: "100%",
                                borderRadius: "10px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        paddingLeft: "10px",
                                        paddingRight: "10px",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "13px !important",
                                            color: "#6c86ad !important",
                                            marginTop: "5px",
                                        }}
                                    >
                                        {" "}
                                        {rateState
                                            ? `${
                                                  sellTokens
                                                      ? sellTokens[sellSelected]
                                                            .symbol
                                                      : ""
                                              }/${
                                                  buyTokens
                                                      ? buyTokens[buySelected]
                                                            .symbol
                                                      : ""
                                              }`
                                            : `Price (${
                                                  buyTokens
                                                      ? buyTokens[buySelected]
                                                            .symbol
                                                      : ""
                                              }/${
                                                  sellTokens
                                                      ? sellTokens[sellSelected]
                                                            .symbol
                                                      : ""
                                              })`}{" "}
                                    </Typography>
                                    
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                    }}
                                >
                                    <Button>rate</Button>
                                    <TextField
                                        defaultValue={1}
                                        type="number"
                                        sx={{
                                            textAlign: "left !important",
                                            marginLeft: "auto",
                                            marginRight: "0",
                                        }}
                                        onChange={handleRateChange}
                                        value={rate}
                                        onBlur={(e) => {
                                            let num = buyAmount;
                                            let r = rate;
                                            validateBuyAmount(num);
                                            if (r === "0" || r === "") {
                                                setRate(1);
                                            }
                                        }}
                                    ></TextField>
                                </div>
                            </div>
                        </Card> */}
                    </div>
                    <Button
                        className="click-button"
                        style={{
                            marginTop: "20px",
                            width: "100%",
                            padding: "2.5px 0px 2.5px 0px",
                            height: "50px",
                            backgroundImage:
                                "linear-gradient(to right,#4ba1d8,#4464e0 95%)",
                            color: "white",
                        }}
                        // onClick={handleBuyClick}
                    >
                        MAKE LIMIT ORDER
                    </Button>
                </div>
                {/* <Dialog open={open} onClose={handleClose}>
                    <DialogTitle sx={{ width: "500px" }}>
                        Input Token Address
                    </DialogTitle>
                    <TextField
                        label="Token Address"
                        variant="filled"
                        sx={{
                            marginLeft: "100px",
                            marginRight: "100px",
                            marginTop: "25px",
                            color: "000 !important",
                        }}
                        value={newTokenAddress}
                        onChange={handleNewTokenInputChange}
                    >
                        test
                    </TextField>

                    <Button
                        onClick={handleFinalAddToken}
                        sx={{
                            marginTop: "20px",
                            backgroundColor: "rgb(13, 13, 52)",
                            width: "100px",
                            marginLeft: "200px",
                        }}
                    >
                        Add
                    </Button>
                    <B sx={{ height: "50px" }}></B>
                </Dialog> */}
            </div>
        </DexExchangeContainer>
    );
};

export default DexExchange;
