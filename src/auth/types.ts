/* eslint-disable no-unused-vars */
// ----------------------------------------------------------------------
import { Api } from 'telegram';

export type ActionMapType<M extends { [index: string]: any }> = {
	[Key in keyof M]: M[Key] extends undefined
		? {
				type: Key;
		  }
		: {
				type: Key;
				payload: M[Key];
		  };
};

export type AuthUserType = null | Record<string, any>;

export type AuthStateType = {
	isAuthenticated: boolean;
	isInitialized: boolean;
	user: AuthUserType;
	tgMessages: Api.Message[];
	isTgLoading: boolean;
};

// ----------------------------------------------------------------------

export type UserContextType = {
	isAuthenticated: boolean;
	isInitialized: boolean;
	user: AuthUserType;
	login: (__userInfo: AuthUserType) => Promise<void>;
	logout: () => void;
	tgMessages: Api.Message[];
	addMessage: (__message: Api.Message) => void;
	editMessage: (__messageId: number, __newContent: Api.Message) => void;
	deleteMessages: (__messageIds: number[]) => void;
	isTgLoading: boolean;
};

export enum ActionTypes {
	INITIAL = 'INITIAL',
	TG_MESSAGES = 'TG_MESSAGES',
	LOGIN = 'LOGIN',
	REGISTER = 'REGISTER',
	LOGOUT = 'LOGOUT',
	ADD_MESSAGE = 'ADD_MESSAGE',
	EDIT_MESSAGE = 'EDIT_MESSAGE',
	DELETE_MESSAGES = 'DELETE_MESSAGES',
}
