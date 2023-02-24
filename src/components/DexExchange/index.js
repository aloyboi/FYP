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
import Text from "../../common/components/Text";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import { Switch } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { FormGroup } from "@mui/material";
import { FormControlLabel } from "@mui/material";
import Select from "@mui/material/Select";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useDispatch, useSelector } from "react-redux";
import "./dex.css";
import B from "@mui/material/Box";
import { marginTop } from "styled-system";
import {
    SET_BUY_SELL_TAB,
    SET_CURR_REF_TOKEN,
    SET_CURR_AGAINST_TOKEN,
    SET_ALL_TOKENS,
} from "../../redux/redux-actions/actions";

import {
    createLimitBuyOrder,
    createLimitSellOrder,
    addToken,
    getBalance,
} from "../../scripts/functions";

const DexExchange = () => {
    //Selectors
    const buy_sell_selected = useSelector(
        (state) => state.tabValue.buySellSelected
    );
    //const selectMessage = (state) => state.message.message;
    const curr = useSelector((state) => state.account.address);
    const allTokens = useSelector((state) => state.token.all_tokens);

    const [buySellSelected, setBuySellSelected] = useState(0); //tab
    const [refTokenSelected, setRefTokenSelected] = useState(null); //top token
    const [againstTokenSelected, setAgainstTokenSelected] = useState(null); //bottom token
    const [waiveFees, setWaiveFees] = useState(false);
    const [refTextFieldError, setRefTextFieldError] = useState(false);
    const [refTextFieldHtext, setRefTextFieldHtext] = useState("");
    const [againstTextFieldError, setAgainstTextFieldError] = useState(false);
    const [againstTextFieldHtext, setAgainstTextFieldHtext] = useState("");

    const [refTokenAmount, setRefTokenAmount] = useState(0);
    const [againstTokenAmount, setAgainstTokenAmount] = useState(0);

    const [rateTextFieldError, setRateTextFieldError] = useState(false);
    const [rateTextFieldHtext, setRateTextFieldHtext] = useState("");
    const [rate, setRate] = useState(0);

    const [buyBalance, setBuyBalance] = useState(0);
    const [sellBalance, setSellBalance] = useState(0);
    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);
    const [newTokenAddress, setNewTokenAddress] = React.useState("");
    const adminAcc = process.env.REACT_APP_ADMIN_ADDRESS;

    function toFixed(num, fixed) {
        var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
        return num.toString().match(re)[0];
    }

    const handleRefTokenSelectChange = (event) => {
        console.log(event.target.value);
        setRefTokenSelected(event.target.value);
        dispatch({
            type: SET_CURR_REF_TOKEN,
            payload: event.target.value, //index of all_tokens, have to  verify what event.target.value returns
        });
        // getSellBalance(event.target.value);
    };

    const handleAgainstTokenSelectChange = (event) => {
        setAgainstTokenSelected(event.target.value);
        dispatch({
            type: SET_CURR_AGAINST_TOKEN,
            payload: event.target.value, //index of all_tokens, have to  verify what event.target.value returns
        });
    };

    // Buy/Sell tab
    const handleBuySellSelectedChange = (event, newValue) => {
        console.log(newValue);
        dispatch({ type: SET_BUY_SELL_TAB, payload: newValue });
        setBuySellSelected(newValue);
    };

    //If sell tab selected, get balance of refToken
    const getSellBalance = async (target) => {
        let sel = refTokenSelected;
        await getBalance(allTokens[sel].address, (balance, locked) => {
            setSellBalance(balance - locked);
        });
    };

    //If buy tab selected, get balance of againstToken
    const getBuyBalance = (target) => {
        let buy = againstTokenSelected;
        getBalance(allTokens[buy].address, (balance, locked) => {
            setBuyBalance(balance - locked);
        });
    };

    const dispatchSnackBar = (message) => {
        dispatch({
            type: LOG_MESSAGE,
            payload: message,
        });
    };

    const dispatchSnackBarDisplay = (isDisplay) => {
        dispatch({
            type: IS_MESSAGE_DISPLAY,
            payload: isDisplay,
        });
    };

    const handleRefAmountChange = (e) => {
        validateRefTokenAmount(e.target.value);
        // getBuyBalance(number);
    };

    const handleAgainstAmountChange = (e) => {
        validateAgainstTokenAmount(e.target.value);
    };

    const handleRateChange = (e) => {
        // event.preventDefault();
        validateRate(e.target.value);
    };

    const validateRefTokenAmount = (amt) => {
        if (refTokenSelected == null) {
            setRefTextFieldError(true);
            setRefTextFieldHtext("Please select a Token first");
            // turn off error after 2 seconds
            setTimeout(() => {
                setRefTextFieldError(false);
                setRefTextFieldHtext("");
            }, 2000);
            return;
        }

        let tokenDecimal = allTokens[refTokenSelected].decimals;
        let number = amt;
        let regex;
        if (tokenDecimal == 18) regex = /^(?!0\d|$)\d*(\.\d{1,18})?$/;
        else if (tokenDecimal == 6) regex = /^(?!0\d|$)\d*(\.\d{1,6})?$/;
        const letterRegex = /^\d*\.?\d*$/;

        if (number === 0 || number === "") {
            setRefTokenAmount(0);
            setRate(0);
            return;
        }

        //test for letters
        if (!letterRegex.test(number)) {
            console.log("enter");
            setRefTextFieldError(true);
            setRefTextFieldHtext("Please enter valid numbers only");
            // turn off error after 2 seconds
            setTimeout(() => {
                setRefTextFieldError(false);
                setRefTextFieldHtext("");
            }, 2000);
            return;
        }

        // ignore the '.' and '0' at the end of the string
        let charNum = number.toString();
        const lastChar = charNum[charNum.length - 1];
        const firstChar = charNum[0];
        const secondChar = charNum[1];
        if (lastChar === ".") {
            setRefTextFieldError(false);
            setRefTextFieldHtext("");
            setRefTokenAmount(number);
            if (rate != 0) {
                setAgainstTokenAmount(number * rate);
            } else if (againstTokenAmount != 0 && rate == 0) {
                setRate(againstTokenAmount / number);
            }
            return;
        }
        if (lastChar === "0") {
            setRefTextFieldError(false);
            setRefTextFieldHtext("");
            setRefTokenAmount(number);
            if (rate != 0) {
                setAgainstTokenAmount(number * rate);
            } else if (againstTokenAmount != 0 && rate == 0) {
                setRate(againstTokenAmount / number);
            }
            return;
        }
        if (firstChar === "0" && secondChar !== ".") {
            setRefTextFieldError(false);
            setRefTextFieldHtext("");
            number = number.substring(1);
            setRefTokenAmount(number);
            if (rate != 0) {
                setAgainstTokenAmount(number * rate);
            } else if (againstTokenAmount != 0 && rate == 0) {
                setRate(againstTokenAmount / number);
            }
            return;
        }

        if (tokenDecimal == 18) {
            //test for < 18 decimal places
            if (regex.test(number)) {
                setRefTextFieldHtext("");
                setRefTextFieldError(false);

                setRefTokenAmount(number);
                if (rate != 0) {
                    setAgainstTokenAmount(number * rate);
                } else if (againstTokenAmount != 0 && rate == 0) {
                    setRate(againstTokenAmount / number);
                }
                return;
            } else {
                setRefTextFieldError(true);
                setRefTextFieldHtext("Up to 18 decimal places");
                setTimeout(() => {
                    setRefTextFieldError(false);
                    setRefTextFieldHtext("");
                }, 2000);
                number = toFixed(number, 18);
                setRefTokenAmount(number);
                if (rate != 0) {
                    setAgainstTokenAmount(number * rate);
                } else if (againstTokenAmount != 0 && rate == 0) {
                    setRate(againstTokenAmount / number);
                }
                return;
            }
        } else if (tokenDecimal == 6) {
            //test for < 6 decimal places
            if (regex.test(number)) {
                setRefTextFieldHtext("");
                setRefTextFieldError(false);
                setRefTokenAmount(number);
                if (rate != 0) {
                    setAgainstTokenAmount(number * rate);
                } else if (againstTokenAmount != 0 && rate == 0) {
                    setRate(againstTokenAmount / number);
                }
            }
            //else reduce number to 6 decimal places
            else {
                setRefTextFieldError(true);
                setRefTextFieldHtext("Up to 6 decimal places");
                setTimeout(() => {
                    setRefTextFieldError(false);
                    setRefTextFieldHtext("");
                }, 2000);
                number = toFixed(number, 6);
                setRefTokenAmount(number);
                if (rate != 0) {
                    setAgainstTokenAmount(number * rate);
                } else if (againstTokenAmount != 0 && rate == 0) {
                    setRate(againstTokenAmount / number);
                }
            }
        }
    };

    const validateAgainstTokenAmount = (amt) => {
        if (againstTokenSelected == null) {
            setAgainstTextFieldError(true);
            setAgainstTextFieldHtext("Please select a Token first");
            // turn off error after 2 seconds
            setTimeout(() => {
                setAgainstTextFieldError(false);
                setAgainstTextFieldHtext("");
            }, 2000);
            return;
        }

        let tokenDecimal = allTokens[againstTokenSelected].decimals;
        let number = amt;
        let regex;
        if (tokenDecimal == 18) regex = /^(?!0\d|$)\d*(\.\d{1,18})?$/;
        else if (tokenDecimal == 6) regex = /^(?!0\d|$)\d*(\.\d{1,6})?$/;
        const letterRegex = /^\d*\.?\d*$/;

        if (number === 0 || number === "") {
            setAgainstTokenAmount(0);
            setRate(0);
            return;
        }

        //test for letters
        if (!letterRegex.test(number)) {
            console.log("enter");
            setAgainstTextFieldError(true);
            setAgainstTextFieldHtext("Please enter valid numbers only");
            // turn off error after 2 seconds
            setTimeout(() => {
                setAgainstTextFieldError(false);
                setAgainstTextFieldHtext("");
            }, 2000);
            return;
        }

        // ignore the '.' and '0' at the end of the string
        let charNum = number.toString();
        const lastChar = charNum[charNum.length - 1];
        const firstChar = charNum[0];
        const secondChar = charNum[1];
        if (lastChar === ".") {
            setAgainstTextFieldError(false);
            setAgainstTextFieldHtext("");
            setAgainstTokenAmount(number);
            if (refTokenAmount != 0) {
                setRate(number / refTokenAmount);
            } else if (refTokenAmount == 0 && rate != 0) {
                setRefTokenAmount(number / rate);
            }
            return;
        }
        if (lastChar === "0") {
            setAgainstTextFieldError(false);
            setAgainstTextFieldHtext("");
            setAgainstTokenAmount(number);
            if (refTokenAmount != 0) {
                setRate(number / refTokenAmount);
            } else if (refTokenAmount == 0 && rate != 0) {
                setRefTokenAmount(number / rate);
            }
            return;
        }
        if (firstChar === "0" && secondChar !== ".") {
            setAgainstTextFieldError(false);
            setAgainstTextFieldHtext("");
            number = number.substring(1);
            setAgainstTokenAmount(number);
            if (refTokenAmount != 0) {
                setRate(number / refTokenAmount);
            } else if (refTokenAmount == 0 && rate != 0) {
                setRefTokenAmount(number / rate);
            }
            return;
        }

        if (tokenDecimal == 18) {
            //test for < 18 decimal places
            if (regex.test(number)) {
                setRefTextFieldHtext("");
                setRefTextFieldError(false);

                setAgainstTokenAmount(number);
                if (refTokenAmount != 0) {
                    setRate(number / refTokenAmount);
                } else if (refTokenAmount == 0 && rate != 0) {
                    setRefTokenAmount(number / rate);
                }
                return;
            } else {
                setAgainstTextFieldError(true);
                setAgainstTextFieldHtext("Up to 18 decimal places");
                setTimeout(() => {
                    setAgainstTextFieldError(false);
                    setAgainstTextFieldHtext("");
                }, 2000);
                number = toFixed(number, 18);
                setAgainstTokenAmount(number);
                if (refTokenAmount != 0) {
                    setRate(number / refTokenAmount);
                } else if (refTokenAmount == 0 && rate != 0) {
                    setRefTokenAmount(number / rate);
                }
                return;
            }
        } else if (tokenDecimal == 6) {
            //test for < 6 decimal places
            if (regex.test(number)) {
                setAgainstTextFieldHtext("");
                setAgainstTextFieldError(false);
                setAgainstTokenAmount(number);
                if (refTokenAmount != 0) {
                    setRate(number / refTokenAmount);
                } else if (refTokenAmount == 0 && rate != 0) {
                    setRefTokenAmount(number / rate);
                }
            }
            //else reduce number to 6 decimal places
            else {
                setAgainstTextFieldError(true);
                setAgainstTextFieldHtext("Up to 6 decimal places");
                setTimeout(() => {
                    setAgainstTextFieldError(false);
                    setAgainstTextFieldHtext("");
                }, 2000);
                number = toFixed(number, 6);
                setAgainstTokenAmount(number);
                if (refTokenAmount != 0) {
                    setRate(number / refTokenAmount);
                } else if (refTokenAmount == 0 && rate != 0) {
                    setRefTokenAmount(number / rate);
                }
            }
        }
    };

    const addTokens = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleNewTokenInputChange = (e) => {
        setNewTokenAddress(e.target.value);
    };

    const handleFinalAddToken = async () => {
        console.log(newTokenAddress);
        await addToken(newTokenAddress, (e) => {
            console.log(e);
        });
        setOpen(false);
    };

    const handleWaiveFees = () => {
        setWaiveFees(!waiveFees);
        console.log(!waiveFees);
    };

    const validateRate = (amt) => {
        if (refTokenSelected == null || againstTokenSelected == null) {
            setRateTextFieldError(true);
            setRateTextFieldHtext("Please select a Token first");
            // turn off error after 2 seconds
            setTimeout(() => {
                setRateTextFieldError(false);
                setRateTextFieldHtext("");
            }, 2000);
            return;
        }

        let number = amt;
        const letterRegex = /^\d*\.?\d*$/;

        if (number === 0 || number === "") {
            setRate(0);
            setAgainstTokenAmount(0);
            setRefTokenAmount(0);
            return;
        }

        //test for letters
        if (!letterRegex.test(number)) {
            setRateTextFieldError(true);
            setRateTextFieldHtext("Please enter valid numbers only");
            // turn off error after 2 seconds
            setTimeout(() => {
                setRateTextFieldError(false);
                setRateTextFieldHtext("");
            }, 2000);
            return;
        }

        // ignore the '.' and '0' at the end of the string
        let charNum = number.toString();
        const lastChar = charNum[charNum.length - 1];
        const firstChar = charNum[0];
        const secondChar = charNum[1];
        if (lastChar === ".") {
            setRateTextFieldError(false);
            setRateTextFieldHtext("");
            setRate(number);
            if (refTokenAmount != 0) {
                setAgainstTokenAmount(number * refTokenAmount);
            } else if (refTokenAmount == 0 && againstTokenAmount != 0) {
                setRefTokenAmount(againstTokenAmount / number);
            }
            return;
        }
        if (lastChar === "0") {
            setRateTextFieldError(false);
            setRateTextFieldHtext("");
            setRate(number);
            if (refTokenAmount != 0) {
                setAgainstTokenAmount(number * refTokenAmount);
            } else if (refTokenAmount == 0 && againstTokenAmount != 0) {
                setRefTokenAmount(againstTokenAmount / number);
            }
            return;
        }
        if (firstChar === "0" && secondChar !== ".") {
            setRateTextFieldError(false);
            setRateTextFieldHtext("");
            number = number.substring(1);
            setRate(number);
            if (refTokenAmount != 0) {
                setAgainstTokenAmount(number * refTokenAmount);
            } else if (refTokenAmount == 0 && againstTokenAmount != 0) {
                setRefTokenAmount(againstTokenAmount / number);
            }
            return;
        }

        setRateTextFieldHtext("");
        setRateTextFieldError(false);
        setRate(number);
        if (refTokenAmount != 0) {
            setAgainstTokenAmount(number * refTokenAmount);
        } else if (refTokenAmount == 0 && againstTokenAmount != 0) {
            setRefTokenAmount(againstTokenAmount / number);
        }
    };

    // const displayTempMessage = (message) => {
    //     dispatchSnackBar(message);
    //     dispatchSnackBarDisplay(true);
    //     setTimeout(() => {
    //         dispatchSnackBar("");
    //         dispatchSnackBarDisplay(false);
    //     }, 2000);
    // };

    const handleMakeOrderClick = () => {
        if (buySellSelected === 0) {
            createLimitSellOrder(
                allTokens[refTokenSelected].address,
                refTokenAmount.toString(),
                allTokens[againstTokenSelected].address,
                againstTokenAmount.toString(),
                rate.toString(),
                waiveFees,
                (e) => {
                    displayTempMessage(e);
                    dispatch({ type: INC_ORDER_COUNT });
                },
                (e) => {
                    displayTempMessage(e);
                    dispatch({ type: INC_ORDER_COUNT });
                },
                displayTempMessage
            );
        } else {
            createLimitBuyOrder(
                allTokens[refTokenSelected].address,
                refTokenAmount.toString(),
                allTokens[againstTokenSelected].address,
                againstTokenAmount.toString(),
                rate.toString(),
                waiveFees,
                (e) => {
                    displayTempMessage(e);
                    dispatch({ type: INC_ORDER_COUNT });
                },
                (e) => {
                    displayTempMessage(e);
                    dispatch({ type: INC_ORDER_COUNT });
                },
                displayTempMessage
            );
        }
    };

    useEffect(() => {
        //should only be called on initiation
        dispatch({ type: SET_ALL_TOKENS, payload: data.tokens });

        // eslint-disable-next-line
    }, []);

    return (
        <DexExchangeContainer>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "500px",
                    height: "620px",
                    typography: "body1",
                    color: "white",
                    backgroundColor: "#152149",
                    borderRadius: "10px",
                    marginTop: "10rem",
                    marginLeft: "30rem",
                }}
            >
                <Tabs
                    value={buySellSelected}
                    onChange={handleBuySellSelectedChange}
                    sx={{ height: "40px" }}
                >
                    <Tab label="Sell" value={0} />
                    <Tab label="Buy" value={1} />
                    {curr ? (
                        curr.toLowerCase() === adminAcc.toLowerCase() ? (
                            <Tooltip title="Click Here to Add Tokens">
                                <Fab
                                    sx={{
                                        marginLeft: "220px",
                                        marginTop: "15px",
                                        marginRight: "2px",
                                        width: "38px",
                                        height: "38px",
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
                    ) : null}
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "15px !important",
                                    color: "#6c86ad !important",
                                    marginBottom: "1rem",
                                }}
                            >
                                {buySellSelected === 0 ? "You Sell" : "You Buy"}
                            </Typography>
                            {buySellSelected === 0 ? (
                                <Typography
                                    sx={{
                                        fontSize: "15px !important",
                                        color: "#6c86ad !important",
                                        marginLeft: "auto",
                                        marginRight: "0",
                                    }}
                                >
                                    Balance:
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
                                    <InputLabel
                                        id="demo-simple-select-label"
                                        sx={{ color: "white" }}
                                    >
                                        Token
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={refTokenSelected}
                                        label="sell token"
                                        onChange={handleRefTokenSelectChange}
                                        sx={{ color: "white" }}
                                    >
                                        {allTokens
                                            ? allTokens.map((item, index) => {
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
                                error={refTextFieldError}
                                defaultValue={0}
                                sx={{
                                    width: "70%",
                                    marginLeft: "10px",
                                    color: "white !important",
                                }}
                                onChange={handleRefAmountChange}
                                onBlur={handleRefAmountChange}
                                value={refTokenAmount}
                                helperText={refTextFieldHtext}
                                label={refTextFieldError ? "Error" : undefined}
                                id={"outlined-error-helper-text"}
                            ></TextField>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography
                                sx={{
                                    fontSize: "15px !important",
                                    color: "#6c86ad !important",
                                }}
                            >
                                {refTokenSelected
                                    ? allTokens[refTokenSelected].name
                                    : null}
                            </Typography>
                        </div>
                    </Card>

                    <Card
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
                                    marginBottom: "1rem",
                                }}
                            >
                                For
                            </Typography>
                            {buySellSelected === 1 ? (
                                <Typography
                                    sx={{
                                        fontSize: "15px !important",
                                        color: "#6c86ad !important",
                                        marginLeft: "auto",
                                        marginRight: "0",
                                    }}
                                >
                                    Balance:
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
                                    <InputLabel
                                        id="demo-simple-select-label"
                                        sx={{ color: "white" }}
                                    >
                                        Token
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={againstTokenSelected}
                                        label="Token"
                                        onChange={
                                            handleAgainstTokenSelectChange
                                        }
                                        sx={{ color: "white" }}
                                    >
                                        {allTokens
                                            ? allTokens.map((item, index) => {
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
                                error={againstTextFieldError}
                                defaultValue={0}
                                sx={{
                                    width: "70%",
                                    marginLeft: "10px",
                                    color: "white !important",
                                }}
                                onChange={handleAgainstAmountChange}
                                onBlur={handleAgainstAmountChange}
                                value={againstTokenAmount}
                                helperText={againstTextFieldHtext}
                                label={
                                    againstTextFieldError ? "Error" : undefined
                                }
                                id={"outlined-error-helper-text"}
                            ></TextField>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography
                                sx={{
                                    fontSize: "15px !important",
                                    color: "#6c86ad !important",
                                }}
                            >
                                {againstTokenSelected
                                    ? allTokens[againstTokenSelected].name
                                    : null}
                            </Typography>
                        </div>
                    </Card>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            marginTop: "10px",
                        }}
                    >
                        <Card
                            sx={{
                                height: "90px",
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
                                    {/* <Typography
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
                                    </Typography> */}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                    }}
                                >
                                    <Button
                                        sx={{
                                            marginTop: "25px",
                                            position: "fixed",
                                        }}
                                    >
                                        rate
                                    </Button>
                                    <TextField
                                        error={rateTextFieldError}
                                        defaultValue={0}
                                        sx={{
                                            width: "65%",
                                            marginLeft: "145px",
                                            marginTop: "12px",
                                            color: "white !important",
                                        }}
                                        onChange={handleRateChange}
                                        onBlur={handleRateChange}
                                        value={rate}
                                        helperText={rateTextFieldHtext}
                                        label={
                                            rateTextFieldError
                                                ? "Error"
                                                : undefined
                                        }
                                        id={"outlined-error-helper-text"}
                                    ></TextField>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <FormControlLabel
                        control={<Switch sx={{}} onClick={handleWaiveFees} />}
                        label="Waive Fees"
                        labelPlacement="start"
                        sx={{ marginTop: "5px", marginBottom: "-8px" }}
                    />

                    {refTokenSelected != againstTokenSelected &&
                    refTokenSelected != null &&
                    againstTokenSelected != null ? (
                        <Button
                            className="click-button"
                            style={{
                                marginTop: "0px",
                                width: "100%",
                                padding: "2.5px 0px 2.5px 0px",
                                height: "50px",
                                backgroundImage:
                                    "linear-gradient(to right,#4ba1d8,#4464e0 95%)",
                                color: "white",
                            }}
                            onClick={handleMakeOrderClick}
                        >
                            MAKE LIMIT ORDER
                        </Button>
                    ) : (
                        <Button
                            className="click-button"
                            disabled={true}
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                padding: "2.5px 0px 2.5px 0px",
                                height: "50px",
                                backgroundColor: "grey",
                                color: "white",
                            }}
                            onClick={handleMakeOrderClick}
                        >
                            MAKE LIMIT ORDER
                        </Button>
                    )}
                </div>

                <Dialog open={open} onClose={handleClose}>
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
                        Add New Token
                    </Button>
                    <B sx={{ height: "50px" }}></B>
                </Dialog>
            </div>
        </DexExchangeContainer>
    );
};

export default DexExchange;
