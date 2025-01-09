import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios from '../utils/axios';
import localStorageAvailable from '../utils/localStorageAvailable';
//
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';
import { telegramClient } from '../utils/telegram';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
	INITIAL = 'INITIAL',
	LOGIN = 'LOGIN',
	REGISTER = 'REGISTER',
	LOGOUT = 'LOGOUT',
}

type Payload = {
	[Types.INITIAL]: {
		isAuthenticated: boolean;
		user: AuthUserType;
	};
	[Types.LOGIN]: {
		user: AuthUserType;
	};
	[Types.REGISTER]: {
		user: AuthUserType;
	};
	[Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
	isInitialized: false,
	isAuthenticated: false,
	user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
	if (action.type === Types.INITIAL) {
		return {
			isInitialized: true,
			isAuthenticated: action.payload.isAuthenticated,
			user: action.payload.user,
		};
	}
	if (action.type === Types.LOGIN) {
		return {
			...state,
			isAuthenticated: true,
			user: action.payload.user,
		};
	}
	if (action.type === Types.REGISTER) {
		return {
			...state,
			isAuthenticated: true,
			user: action.payload.user,
		};
	}
	if (action.type === Types.LOGOUT) {
		return {
			...state,
			isAuthenticated: false,
			user: null,
		};
	}
	return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
	children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [state, dispatch] = useReducer(reducer, initialState);

	const storageAvailable = localStorageAvailable();

	const initialize = useCallback(async() => {
		try {
			const savedSession = storageAvailable ? localStorage.getItem('telegram_session') || '': '';

			if (savedSession) {
				const client = await telegramClient.connect();

				const me = await client.getMe();
				dispatch({
					type: Types.INITIAL,
					payload: {
						isAuthenticated: true,
						user: {
							phoneNumber: me.phone,
							displayName: me.firstName,
						},
					},
				});
			} else {
				dispatch({
					type: Types.INITIAL,
					payload: {
						isAuthenticated: false,
						user: null,
					},
				});
			}
		} catch (error) {
			localStorage.removeItem('telegram_session');
			console.error(error);
			dispatch({
				type: Types.INITIAL,
				payload: {
					isAuthenticated: false,
					user: null,
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageAvailable]);

	useEffect(() => {
		initialize();
	}, [initialize]);

	// LOGIN
	const login = useCallback(async(userInfo: AuthUserType) => {

		dispatch({
			type: Types.LOGIN,
			payload: {
				user: userInfo,
			},
		});
	}, []);

	// REGISTER
	const register = useCallback(
		async(email: string, password: string, firstName: string, lastName: string) => {
			const response = await axios.post('/api/account/register', {
				email,
				password,
				firstName,
				lastName,
			});
			const { accessToken, user } = response.data;

			localStorage.setItem('accessToken', accessToken);

			dispatch({
				type: Types.REGISTER,
				payload: {
					user,
				},
			});
		},
		[]
	);

	// LOGOUT
	const logout = useCallback(() => {
		dispatch({
			type: Types.LOGOUT,
		});
	}, []);

	const memoizedValue = useMemo(
		() => ({
			isInitialized: state.isInitialized,
			isAuthenticated: state.isAuthenticated,
			user: state.user,
			method: 'jwt',
			login,
			loginWithGoogle: () => {},
			loginWithGithub: () => {},
			loginWithTwitter: () => {},
			register,
			logout,
		}),
		[state.isAuthenticated, state.isInitialized, state.user, login, logout, register]
	);

	return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
