import {
    SET_ACCOUNT,
    SET_DEPOSIT_AMOUNT,
    SET_TAB_VALUE,
    SET_BUY_SELL_TAB,
} from "../redux-actions/actions.js";

const defaultAccount = {
    address: null,
    deposit: 0,
};
//reducer
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

const defaultValue = {
    value: "0",
    buySellSelected: 0, //if 0, buy Selected, if 1 sell Selected
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
