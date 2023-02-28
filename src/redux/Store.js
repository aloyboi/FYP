import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import {
    accountReducer,
    tabValueReducer,
    tokenReducer,
    orderReducer,
    messageReducer,
} from "./redux-reducers/reducers";

const rootReducer = combineReducers({
    account: accountReducer,
    tabValue: tabValueReducer,
    token: tokenReducer,
    orders: orderReducer,
    message: messageReducer,
});

const store = createStore(rootReducer, compose(applyMiddleware(thunk)));

export { store };
