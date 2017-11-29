import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const rootReducer = () => ({});
const initialState = {};

const store = createStore(rootReducer, initialState, applyMiddleware(thunk));

export default store;
