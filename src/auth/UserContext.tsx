import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { Api } from 'telegram';
// utils
import localStorageAvailable from '../utils/localStorageAvailable';
import { getTelegramClient } from '../utils/telegram';
//
import { ActionMapType, ActionTypes, AuthStateType, AuthUserType, UserContextType } from './types';
import { FOLDER_PREFIX } from '../utils/constant';

type Payload = {
	[ActionTypes.INITIAL]: {
		isAuthenticated: boolean;
		user: AuthUserType;
	};
	[ActionTypes.TG_MESSAGES]: {
		messages: Api.Message[];
	};
	[ActionTypes.LOGIN]: {
		user: AuthUserType;
		messages: Api.Message[];
	};
	[ActionTypes.LOGOUT]: undefined;
	[ActionTypes.ADD_MESSAGE]: {
		message: Api.Message;
	};
	[ActionTypes.EDIT_MESSAGE]: {
		messageId: number;
		newContent: Api.Message;
	};
	[ActionTypes.DELETE_MESSAGES]: {
		messageIds: number[];
	};
};
export type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
	isInitialized: false,
	isAuthenticated: false,
	user: null,
	isTgLoading: true,
	tgMessages: [],
};

const reducer = (state: AuthStateType, action: ActionsType): AuthStateType => {
	switch (action.type) {
		case ActionTypes.INITIAL:
			return {
				isInitialized: true,
				isAuthenticated: action.payload.isAuthenticated,
				user: action.payload.user,
				tgMessages: [],
				isTgLoading: true,
			};

		case ActionTypes.TG_MESSAGES:
			return {
				...state,
				tgMessages: action.payload.messages,
				isTgLoading: false,
			};

		case ActionTypes.LOGIN:
			return {
				...state,
				isAuthenticated: true,
				user: action.payload.user,
				tgMessages: action.payload.messages,
			};

		case ActionTypes.LOGOUT:
			return {
				...state,
				isAuthenticated: false,
				user: null,
				tgMessages: [],
			};

		case ActionTypes.ADD_MESSAGE:
			return {
				...state,
				tgMessages: [...(state.tgMessages || []), action.payload.message],
			};

		case ActionTypes.EDIT_MESSAGE:
			return {
				...state,
				tgMessages: state.tgMessages.map((msg) =>
					msg.id === action.payload.messageId ? action.payload.newContent : msg
				),
			};

		case ActionTypes.DELETE_MESSAGES:
			return {
				...state,
				tgMessages: (state.tgMessages || []).filter(
					(msg) => !action.payload.messageIds.includes(msg.id)
				),
			};

		default:
			return state;
	}
};

// ----------------------------------------------------------------------

export const UserContext = createContext<UserContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
	children: React.ReactNode;
};

export function UserProvider({ children }: AuthProviderProps) {
	const [state, dispatch] = useReducer(reducer, initialState);

	const storageAvailable = localStorageAvailable();

	const initialize = useCallback(async () => {
		try {
			const savedSession = storageAvailable ? localStorage.getItem('telegram_session') || '' : '';

			if (savedSession) {
				const client = await getTelegramClient();
				const savedMessagesPeer = await client.getInputEntity('me');
				const me = await client.getMe();
				dispatch({
					type: ActionTypes.INITIAL,
					payload: {
						isAuthenticated: true,
						user: {
							tgId: me.id.toString(),
							phoneNumber: me.phone,
							displayName: `${me.firstName || ''} ${me.lastName || ''}`,
						},
					},
				});
				client.addEventHandler((update) => {
					if (update instanceof Api.UpdateNewMessage) {
						const message = update.message as Api.Message;
						if (message.peerId instanceof Api.PeerUser) {
							dispatch({
								type: ActionTypes.ADD_MESSAGE,
								payload: {
									message,
								},
							});
						}
					}

					if (update instanceof Api.UpdateEditMessage) {
						const editedMessage = update.message as Api.Message;
						dispatch({
							type: ActionTypes.EDIT_MESSAGE,
							payload: {
								messageId: editedMessage.id,
								newContent: editedMessage,
							},
						});
					}

					if (update instanceof Api.UpdateDeleteMessages) {
						dispatch({
							type: ActionTypes.DELETE_MESSAGES,
							payload: {
								messageIds: update.messages,
							},
						});
					}
				});
				const messages = await client.getMessages(savedMessagesPeer, {
					search: FOLDER_PREFIX,
				});
				dispatch({
					type: ActionTypes.TG_MESSAGES,
					payload: {
						messages: messages,
					},
				});
			} else {
				dispatch({
					type: ActionTypes.INITIAL,
					payload: {
						isAuthenticated: false,
						user: null,
					},
				});
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			if (errorMessage.includes('AUTH_KEY_DUPLICATED')) {
				localStorage.removeItem('telegram_session');
			}
			console.error(error);
			dispatch({
				type: ActionTypes.INITIAL,
				payload: {
					isAuthenticated: false,
					user: null,
				},
			});
		}
	}, [storageAvailable]);

	useEffect(() => {
		initialize();
	}, [initialize]);

	// LOGIN
	const login = useCallback(async (userInfo: AuthUserType) => {
		const client = await getTelegramClient();
		const savedMessagesPeer = await client.getInputEntity('me');
		const messages = await client.getMessages(savedMessagesPeer, {
			search: FOLDER_PREFIX,
		});
		dispatch({
			type: ActionTypes.LOGIN,
			payload: {
				user: userInfo,
				messages: messages,
			},
		});
	}, []);

	// LOGOUT
	const logout = useCallback(() => {
		dispatch({
			type: ActionTypes.LOGOUT,
		});
	}, []);

	// ADD TG MESSAGE
	const addMessage = useCallback((message: any) => {
		dispatch({
			type: ActionTypes.ADD_MESSAGE,
			payload: { message },
		});
	}, []);

	// EDIT TG MESSAGE
	const editMessage = useCallback((messageId: number, newContent: Api.Message) => {
		dispatch({
			type: ActionTypes.EDIT_MESSAGE,
			payload: { messageId, newContent },
		});
	}, []);

	// DELETE TG MESSAGE
	const deleteMessages = useCallback((messageIds: number[]) => {
		dispatch({
			type: ActionTypes.DELETE_MESSAGES,
			payload: { messageIds },
		});
	}, []);

	const memoizedValue = useMemo(
		() => ({
			isInitialized: state.isInitialized,
			isAuthenticated: state.isAuthenticated,
			user: state.user,
			login,
			logout,
			tgMessages: state.tgMessages,
			addMessage,
			editMessage,
			deleteMessages,
			isTgLoading: state.isTgLoading
		}),
		[
			state.isAuthenticated,
			state.isInitialized,
			state.user,
			state.isTgLoading,
			login,
			logout,
			state.tgMessages,
			addMessage,
			editMessage,
			deleteMessages,
		]
	);

	return <UserContext.Provider value={memoizedValue}>{children}</UserContext.Provider>;
}
