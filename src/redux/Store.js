import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import { accountReducer } from "./redux-reducers/reducers";
import { tabValueReducer } from "./redux-reducers/reducers";

const rootReducer = combineReducers({
    account: accountReducer,
    tabValue: tabValueReducer,
});

const store = createStore(rootReducer, compose(applyMiddleware(thunk)));

export { store };
