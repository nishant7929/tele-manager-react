import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFCodes } from '../../components/hook-form';
import { useUserContext } from '../../auth/useUserContext';
import { verifyOtp } from '../../utils/telegram';
import { userModel } from '../../utils/firebase';
import { UserTypeFirebase } from '../../@types/user';
import { FirebaseError } from 'firebase/app';
import { updateUser } from '../../redux/slices/user';
import { useDispatch } from '../../redux/store';

// ----------------------------------------------------------------------

type FormValuesProps = {
	code1: string;
	code2: string;
	code3: string;
	code4: string;
	code5: string;
};

interface Props {
	phoneNumber: string;
}

export default function AuthVerifyCodeForm({ phoneNumber }: Props) {
	const navigate = useNavigate();
	const { login } = useUserContext();
	const dispatch = useDispatch();

	const { enqueueSnackbar } = useSnackbar();

	const VerifyCodeSchema = Yup.object().shape({
		code1: Yup.string().required('Code is required'),
		code2: Yup.string().required('Code is required'),
		code3: Yup.string().required('Code is required'),
		code4: Yup.string().required('Code is required'),
		code5: Yup.string().required('Code is required'),
	});

	const defaultValues = {
		code1: '',
		code2: '',
		code3: '',
		code4: '',
		code5: '',
	};

	const methods = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(VerifyCodeSchema),
		defaultValues,
	});

	const {
		handleSubmit,
		formState: { isSubmitting, errors },
	} = methods;

	const onSubmit = async (data: FormValuesProps) => {
		try {
			const otp = Object.values(data).join('');
			const { message, success, userInfo } = await verifyOtp(phoneNumber, otp);
			const uid = `${userInfo?.tgId}${userInfo?.phoneNumber.slice(-5)}`;
			if (success) {
				const initData: Partial<UserTypeFirebase> = {
					uid,
					tgId: userInfo?.tgId,
					phoneNumber: userInfo?.phoneNumber,
					fullName: userInfo?.displayName,
					createdAt: new Date().toISOString(),
				};
				const user = await userModel.findByIdOrCreate(uid || '', initData);
				await login(userInfo || {});
				dispatch(updateUser(user));
				navigate(PATH_DASHBOARD.root);
			}
			enqueueSnackbar(message, { variant: success ? 'success' : 'error' });
		} catch (error: any) {
			console.error('Error during form submission:', error);

			if (error instanceof FirebaseError) {
				switch (error.code) {
					case 'permission-denied':
						enqueueSnackbar('You do not have the necessary permissions to perform this action.', {
							variant: 'error',
						});
						break;
					case 'unauthenticated':
						enqueueSnackbar('Your session has expired. Please log in again.', {
							variant: 'warning',
						});
						break;
					default:
						enqueueSnackbar(`Firebase error: ${error.message}`, { variant: 'error' });
						break;
				}
			} else if (error instanceof Error) {
				enqueueSnackbar(error.message, { variant: 'error' });
			} else {
				enqueueSnackbar('An unexpected error occurred. Please try again.', { variant: 'error' });
			}
		}
	};

	return (
		<FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing={3}>
				<RHFCodes keyName="code" inputs={['code1', 'code2', 'code3', 'code4', 'code5']} />

				{(!!errors.code1 ||
					!!errors.code2 ||
					!!errors.code3 ||
					!!errors.code4 ||
					!!errors.code5) && (
					<FormHelperText error sx={{ px: 2 }}>
						Code is required
					</FormHelperText>
				)}

				<LoadingButton
					fullWidth
					size="large"
					type="submit"
					variant="contained"
					loading={isSubmitting}
					sx={{ mt: 3 }}
				>
					Login
				</LoadingButton>
			</Stack>
		</FormProvider>
	);
}
