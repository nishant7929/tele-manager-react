import { createSlice, Dispatch } from '@reduxjs/toolkit';
// utils
import { IUserState } from '../../@types/user';
import { userModel } from '../../utils/firebase';

// ----------------------------------------------------------------------

const initialState: IUserState = {
	isLoading: false,
	error: null,
	user: null,
};

const slice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		// START LOADING
		startLoading(state) {
			state.isLoading = true;
		},

		// HAS ERROR
		hasError(state, action) {
			state.isLoading = false;
			state.error = action.payload;
		},

		// GET USER
		getUserSuccess(state, action) {
			state.isLoading = false;
			state.user = action.payload;
		},

		// UPDATE USER
		updateUser(state, action) {
			state.user = action.payload;
		}

	},
});

// Reducer
export default slice.reducer;

// Actions
export const {
	updateUser
} = slice.actions;


// ----------------------------------------------------------------------

export function getUserData(phoneNumber: string) {
	return async(dispatch: Dispatch) => {
		dispatch(slice.actions.startLoading());
		try {
			const user = await userModel.findByPhoneNumber(phoneNumber);
			dispatch(slice.actions.getUserSuccess(user));
		} catch (error) {
			dispatch(slice.actions.hasError(error));
		}
	};
}
