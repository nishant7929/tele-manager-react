import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import userReducer from './slices/user';

// ----------------------------------------------------------------------

export const rootPersistConfig = {
	key: 'root',
	storage,
	keyPrefix: 'redux-',
	whitelist: [],
};

export const productPersistConfig = {
	key: 'product',
	storage,
	keyPrefix: 'redux-',
	whitelist: ['sortBy', 'checkout'],
};

const rootReducer = combineReducers({
	user: persistReducer(rootPersistConfig, userReducer),
});

export default rootReducer;
