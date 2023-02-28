import {
    SET_ACCOUNT,
    SET_DEPOSIT_AMOUNT,
    SET_INTEREST_RATE,
    SET_TAB_VALUE,
    SET_BUY_SELL_TAB,
    SET_CURR_REF_TOKEN,
    SET_CURR_AGAINST_TOKEN,
    SET_ALL_TOKENS,
    LOG_MESSAGE,
    IS_MESSAGE_DISPLAY,
    SET_IS_ANY_ORDER_CANCELLED,
    SET_GLOBAL_ORDERS,
    // SET_ROWS_BUY_MYORDER,
    // SET_ROWS_SELL_MYORDER,
    SET_ROWS_BUY_GLOBALORDER,
    SET_ROWS_SELL_GLOBALORDER,
    SET_USER_BUY_ORDERS,
    SET_USER_FILLED_ORDERS,
    SET_USER_SELL_ORDERS,
    INC_ORDER_COUNT,
    SET_MY_ORDER_TYPE_SELECTED,
    SET_MY_OR_GLOBAL,
} from "../redux-actions/actions.js";

////////////////////////////////////////////////////////////////////////////////////////

const defaultAccount = {
    address: null,
    deposit: 0,
    interest: 0,
};

export const accountReducer = (state = defaultAccount, action) => {
    switch (action.type) {
        case SET_ACCOUNT:
            return { ...state, address: action.payload };
        case SET_DEPOSIT_AMOUNT:
            return { ...state, deposit: action.payload };
        case SET_INTEREST_RATE:
            return { ...state, interest: action.payload };
        default:
            return state;
    }
};

////////////////////////////////////////////////////////////////////////////////////////

const defaultValue = {
    value: "0", //Home Tab
    buySellSelected: 0, //Buy/Sell Tab
    myOrderTypeSelected: 0,
    // global_or_my_type_selected: "1",
};

export const tabValueReducer = (state = defaultValue, action) => {
    switch (action.type) {
        case SET_TAB_VALUE:
            return { ...state, value: action.payload };
        case SET_BUY_SELL_TAB:
            return { ...state, buySellSelected: action.payload };
        case SET_MY_ORDER_TYPE_SELECTED:
            return { ...state, myOrderTypeSelected: action.payload };
        // case SET_MY_OR_GLOBAL:
        //     return { ...state, global_or_my_type_selected: action.payload };
        default:
            return state;
    }
};

////////////////////////////////////////////////////////////////////////////////////////

const initialState = {
    curr_ref_token: null,
    curr_against_token: null,
    all_tokens: [],
};

export const tokenReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURR_REF_TOKEN:
            return {
                ...state,
                curr_ref_token: action.payload,
            };
        case SET_CURR_AGAINST_TOKEN:
            return {
                ...state,
                curr_against_token: action.payload,
            };
        case SET_ALL_TOKENS:
            return {
                ...state,
                all_tokens: action.payload,
            };

        default:
            return state;
    }
};

////////////////////////////////////////////////////////////////////////////////////////

const initialStateOrders = {
    // rows_buy_myOrders: [],
    // rows_sell_myOrders: [],
    rows_buy_globalOrders: [],
    rows_sell_globalOrders: [],
    user_buy_orders: [],
    user_sell_orders: [],
    user_filled_orders: [],
    is_any_order_cancelled: false,
    order_count: 0,
};

export const orderReducer = (state = initialStateOrders, action) => {
    switch (action.type) {
        // case SET_ROWS_BUY_MYORDER:
        //     return {
        //         ...state,
        //         rows_buy_myOrders: action.payload,
        //     };
        // case SET_ROWS_SELL_MYORDER:
        //     return {
        //         ...state,
        //         rows_sell_myOrders: action.payload,
        //     };
        case SET_ROWS_BUY_GLOBALORDER:
            return {
                ...state,
                rows_buy_globalOrders: action.payload,
            };
        case SET_ROWS_SELL_GLOBALORDER:
            return {
                ...state,
                rows_sell_globalOrders: action.payload,
            };
        case SET_USER_BUY_ORDERS:
            return {
                ...state,
                user_buy_orders: action.payload,
            };
        case SET_USER_SELL_ORDERS:
            return {
                ...state,
                user_sell_orders: action.payload,
            };
        case SET_USER_FILLED_ORDERS:
            return {
                ...state,
                user_filled_orders: action.payload,
            };
        case SET_IS_ANY_ORDER_CANCELLED:
            return {
                ...state,
                is_any_order_cancelled: action.payload,
            };

        // case SET_GLOBAL_ORDERS:
        //     return {
        //         ...state,
        //         global_orders: action.payload,
        //     };
        case INC_ORDER_COUNT:
            return {
                ...state,
                order_count: state.order_count + 1,
            };
        default:
            return state;
    }
};

////////////////////////////////////////////////////////////////////////////////////////

const initialMsg = {
    message: null,
    is_message_display: false,
};

export const messageReducer = (state = initialMsg, action) => {
    switch (action.type) {
        case LOG_MESSAGE:
            return {
                ...state,
                message: action.payload,
            };
        case IS_MESSAGE_DISPLAY:
            return {
                ...state,
                is_message_display: action.payload,
            };
        default:
            return state;
    }
};
