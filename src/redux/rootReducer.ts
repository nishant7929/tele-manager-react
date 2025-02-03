import { combineReducers } from 'redux';
// slices
import userReducer from './slices/user';


const rootReducer = combineReducers({
	user: userReducer,
});

export default rootReducer;
