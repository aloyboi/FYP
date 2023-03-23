import React from "react";
import PropTypes from "prop-types";
import Box from "../../common/components/Box";
import Card from "../../common/components/Card";
import Container from "../../common/components/UI/Container";
import WorkHistoryWrapper, { CounterUpArea } from "./workHistory.style";
import OrderHistory from "../OrderHistory/index.js";
import MyOrderHistory from "../OrderHistory/myIndex.js";
import { Typography } from "@mui/material";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Tab } from "@mui/material";
import { TabPanel } from "@mui/lab";
import { TabContext } from "@mui/lab";
import { TabList } from "@mui/lab";
import { FormControl, InputLabel } from "@mui/material";
import { useEffect } from "react";
import {
    getAllUserBuyOrders,
    getAllUserSellOrders,
    getAllUserFilledOrders,
    getOrderBookByTokenPairs,
    getTokenList,
} from "../../scripts/functions";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    SET_USER_BUY_ORDERS,
    SET_USER_FILLED_ORDERS,
    SET_USER_SELL_ORDERS,
    SET_IS_ANY_ORDER_CANCELLED,
    SET_MY_ORDER_TYPE_SELECTED,
    SET_ROWS_BUY_GLOBALORDER,
    SET_ROWS_SELL_GLOBALORDER,
} from "../../redux/redux-actions/actions";

const WorkHistory = ({ row, col, cardStyle }) => {
    const allTokens = useSelector((state) => state.token.all_tokens);
    const curr = useSelector((state) => state.account.address);
    const cancel = useSelector((state) => state.orders.is_any_order_cancelled);
    const refToken = useSelector((state) => state.token.curr_ref_token);
    const againstToken = useSelector((state) => state.token.curr_against_token);
    const count = useSelector((state) => state.orders.order_count);

    const [value, setValue] = useState("0");
    const [canQueryOrders, setCanQueryOrders] = useState(false);
    const [selectOrderType, setSelectOrderType] = useState(0);
    const dispatch = useDispatch();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeType = (event) => {
        setSelectOrderType(event.target.value);
        dispatch({
            type: SET_MY_ORDER_TYPE_SELECTED,
            payload: event.target.value,
        });
    };

    async function getGlobalOrders() {
        if (refToken == undefined || againstToken == undefined) {
            return 0;
        }

        await getOrderBookByTokenPairs(
            allTokens[refToken].address,
            allTokens[againstToken].address,
            (buyOrders, sellOrders) => {
                let global_buy_orders = [];
                let global_sell_orders = [];
                buyOrders.map((order) => {
                    global_buy_orders.push({
                        amountA: order[4],
                        rate: order[7],
                        amountB: order[6],
                        type: 0,
                    });
                    return 0;
                });
                sellOrders.map((order) => {
                    global_sell_orders.push({
                        amountA: order[4],
                        rate: order[7],
                        amountB: order[6],
                        type: 1,
                    });
                    return 0;
                });
                dispatch({
                    type: SET_ROWS_BUY_GLOBALORDER,
                    payload: global_buy_orders,
                });
                dispatch({
                    type: SET_ROWS_SELL_GLOBALORDER,
                    payload: global_sell_orders,
                });
            }
        );
    }

    async function getOrders() {
        if (allTokens) {
            let tokenAddresses = await getTokenList();
            console.log("token addresses: " + tokenAddresses);
            let buy = await getAllUserBuyOrders(tokenAddresses);
            let sell = await getAllUserSellOrders(tokenAddresses);
            let filled = await getAllUserFilledOrders(tokenAddresses);
            console.log("Buy: " + buy);
            console.log("Sell: " + sell);
            console.log("Filled: " + filled);

            let userBuyOrders = [];
            let userSellOrders = [];
            let userFilledOrders = [];

            buy.map((order) => {
                if (Array.isArray(order)) {
                    userBuyOrders.push({
                        orderId: order[0],
                        type: "buy",
                        tokenA: allTokens.filter(
                            (token) => token.address === order[3]
                        )[0].symbol,
                        amountA: order[4],
                        tokenB: allTokens.filter(
                            (token) => token.address === order[5]
                        )[0].symbol,
                        amountB: order[6],
                        rate: order[7],
                        originalAmountA: order[8],
                        originalAmountB: order[9],
                        waiveFees: order[10],
                        fulfilled: "no",
                    });
                }
            });
            sell.map((order) => {
                if (Array.isArray(order)) {
                    userSellOrders.push({
                        orderId: order[0],
                        type: "buy",
                        tokenA: allTokens.filter(
                            (token) => token.address === order[3]
                        )[0].symbol,
                        amountA: order[4],
                        tokenB: allTokens.filter(
                            (token) => token.address === order[5]
                        )[0].symbol,
                        amountB: order[6],
                        rate: order[7],
                        originalAmountA: order[8],
                        originalAmountB: order[9],
                        waiveFees: order[10],
                        fulfilled: "no",
                    });
                }
            });
            filled.map((order) => {
                //use token address to get token symbol from token array
                if (Array.isArray(order)) {
                    userFilledOrders.push({
                        orderId: order[0],
                        type: order[1] === "0" ? "buy" : "sell",
                        tokenA: allTokens.filter(
                            (token) => token.address === order[3]
                        )[0].symbol,
                        tokenB: allTokens.filter(
                            (token) => token.address === order[4]
                        )[0].symbol,
                        amountFilled: order[5],
                        fillRate: order[6],
                        originalRate: order[7],
                        originalAmountA: order[8],
                        originalAmountB: order[9],
                        waiveFees: order[10],
                        feesPaid: order[11],
                    });
                }
            });
            dispatch({ type: SET_USER_BUY_ORDERS, payload: userBuyOrders });
            dispatch({ type: SET_USER_SELL_ORDERS, payload: userSellOrders });
            dispatch({
                type: SET_USER_FILLED_ORDERS,
                payload: userFilledOrders,
            });
            dispatch({
                type: SET_IS_ANY_ORDER_CANCELLED,
                payload: false,
            });
        }
    }

    useEffect(() => {
        getOrders();
        getGlobalOrders();

        // eslint-disable-next-line
    }, [allTokens, curr, cancel, refToken, againstToken, count]);
    return (
        <WorkHistoryWrapper id="workHistorySection">
            <Container>
                <CounterUpArea>
                    <Card className="card" {...cardStyle}>
                        <TabContext centered value={value}>
                            <Box
                                sx={{
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    color: "white",
                                }}
                            >
                                {value === "1" && curr != null ? (
                                    <Select
                                        id="demo-simple-select"
                                        value={selectOrderType}
                                        onChange={handleChangeType}
                                        sx={{
                                            width: "150px",
                                            color: "white",
                                            position: "fixed",
                                            marginLeft: "400px",
                                        }}
                                    >
                                        <MenuItem value={0}>
                                            Buy Orders
                                        </MenuItem>
                                        <MenuItem value={1}>
                                            Sell Orders
                                        </MenuItem>
                                        <MenuItem value={2}>
                                            FIlled Orders
                                        </MenuItem>
                                    </Select>
                                ) : null}
                                <TabList centered onChange={handleChange}>
                                    <Tab
                                        sx={{
                                            color: "#fff",
                                        }}
                                        label="Global Orders"
                                        value="0"
                                    />
                                    {curr != null ? (
                                        <Tab
                                            sx={{
                                                color: "#fff",
                                            }}
                                            label="My Orders"
                                            value="1"
                                        />
                                    ) : null}
                                </TabList>
                            </Box>

                            <TabPanel value="0">
                                {refToken != null && againstToken != null ? (
                                    <Typography
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        Global Buy Order Book
                                    </Typography>
                                ) : null}
                                <OrderHistory type={0} />
                                {refToken != null && againstToken != null ? (
                                    <Typography
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                        }}
                                    >
                                        Global Sell Order Book
                                    </Typography>
                                ) : null}

                                <OrderHistory type={1} />
                            </TabPanel>
                            <TabPanel value="1">
                                <MyOrderHistory></MyOrderHistory>
                            </TabPanel>
                        </TabContext>
                    </Card>
                </CounterUpArea>
            </Container>
        </WorkHistoryWrapper>
    );
};

// WorkHistory style props
WorkHistory.propTypes = {
    sectionHeader: PropTypes.object,
    sectionTitle: PropTypes.object,
    sectionSubTitle: PropTypes.object,
    row: PropTypes.object,
    col: PropTypes.object,
    cardStyle: PropTypes.object,
};

// WorkHistory default style
WorkHistory.defaultProps = {
    // WorkHistory section row default style
    row: {
        flexBox: true,
        flexWrap: "wrap",
        ml: "-15px",
        mr: "-15px",
    },
    // WorkHistory section col default style
    col: {
        pr: "15px",
        pl: "15px",
        width: [1, 1, 1 / 2, 1 / 2],
        flexBox: true,
        alignSelf: "center",
    },
    // Card default style
    cardStyle: {
        p: ["20px 20px", "30px 20px", "30px 20px", "53px 40px"],
        borderRadius: "10px",
    },

    // Button default style
    btnStyle: {
        minWidth: "156px",
        fontSize: "14px",
        fontWeight: "500",
    },
};

export default WorkHistory;
