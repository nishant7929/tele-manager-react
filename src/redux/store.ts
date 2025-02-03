import { configureStore } from '@reduxjs/toolkit';
import {
	TypedUseSelectorHook,
	useDispatch as useAppDispatch,
	useSelector as useAppSelector,
} from 'react-redux';
import rootReducer from './rootReducer';

// ----------------------------------------------------------------------

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
			immutableCheck: false,
		}),
});

const { dispatch } = store;

const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;

const useDispatch = () => useAppDispatch<AppDispatch>();

export { store, dispatch, useSelector, useDispatch };
