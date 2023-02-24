import {
    SET_ACCOUNT,
    SET_DEPOSIT_AMOUNT,
    SET_TAB_VALUE,
    SET_BUY_SELL_TAB,
    SET_CURR_REF_TOKEN,
    SET_CURR_AGAINST_TOKEN,
    SET_ALL_TOKENS,
} from "../redux-actions/actions.js";

////////////////////////////////////////////////////////////////////////////////////////

const defaultAccount = {
    address: null,
    deposit: 0,
};

export const accountReducer = (state = defaultAccount, action) => {
    switch (action.type) {
        case SET_ACCOUNT:
            return { ...state, address: action.payload };
        case SET_DEPOSIT_AMOUNT:
            return { ...state, deposit: action.payload };
        default:
            return state;
    }
};

////////////////////////////////////////////////////////////////////////////////////////

const defaultValue = {
    value: "0", //Home Tab
    buySellSelected: 0, //Buy/Sell Tab
};

export const tabValueReducer = (state = defaultValue, action) => {
    switch (action.type) {
        case SET_TAB_VALUE:
            return { ...state, value: action.payload };
        case SET_BUY_SELL_TAB:
            return { ...state, buySellSelected: action.payload };
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
    // rows_buy_myOrders:[],
    // rows_sell_myOrders:[],
    // rows_buy_globalOrders:[],
    // rows_sell_globalOrders:[],
    // global_orders:[],
    // user_orders: [],
    // is_any_order_cancelled: false,
    // order_count:0,
};

export const orderReducer = (state = initialStateOrders, action) => {
    switch (action.type) {
        // case SET_ROWS_BUY_MYORDER:
        //     console.log('running')
        //     return {
        //         ...state,
        //         rows_buy_myOrders: action.payload,
        //     }
        // case CLEAR_ROWS_BUY_MYORDER:
        //     return {
        //         ...state,
        //         rows_buy_myOrders: null,
        //     }
        // case SET_ROWS_SELL_MYORDER:
        //     return {
        //         ...state,
        //         rows_sell_myOrders: action.payload,
        //     }
        // case CLEAR_ROWS_SELL_MYORDER:
        //     return {
        //         ...state,
        //         rows_sell_myOrders: null,
        //     }
        // case SET_ROWS_BUY_GLOBALORDER:
        //     console.log('running2')
        //     return {
        //         ...state,
        //         rows_buy_globalOrders: action.payload,
        //     }
        // case CLEAR_ROWS_BUY_GLOBALORDER:
        //     return {
        //         ...state,
        //         rows_buy_globalOrders: null,
        //     }
        // case SET_ROWS_SELL_GLOBALORDER:
        //     return {
        //         ...state,
        //         rows_sell_globalOrders: action.payload,
        //     }
        // case CLEAR_ROWS_SELL_GLOBALORDER:
        //     return {
        //         ...state,
        //         rows_sell_globalOrders: null,
        //     }
        // case SET_USER_ORDERS:
        //     return {
        //         ...state,
        //         user_orders: action.payload,
        //     }
        // case SET_IS_ANY_ORDER_CANCELLED:
        //     return {
        //         ...state,
        //         is_any_order_cancelled: action.payload,
        //     }

        // case SET_GLOBAL_ORDERS:
        //     return {
        //         ...state,
        //         global_orders: action.payload,
        //     }
        // case INC_ORDER_COUNT:
        //     return {
        //         ...state,
        //         order_count: state.order_count + 1,
        // }
        default:
            return state;
    }
};
