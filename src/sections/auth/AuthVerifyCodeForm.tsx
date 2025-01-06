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
import { useAuthContext } from '../../auth/useAuthContext';

// ----------------------------------------------------------------------

type FormValuesProps = {
	code1: string;
	code2: string;
	code3: string;
	code4: string;
	code5: string;
};

export default function AuthVerifyCodeForm() {
	const navigate = useNavigate();
	const { login } = useAuthContext();

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
		mode: 'onChange',
		resolver: yupResolver(VerifyCodeSchema),
		defaultValues,
	});

	const {
		handleSubmit,
		formState: { isSubmitting, errors },
	} = methods;

	const defaultLoginValues = {
		email: 'demo@minimals.cc',
		password: 'demo1234',
	};

	const onSubmit = async(data: FormValuesProps) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			console.log('DATA', Object.values(data).join(''));
			enqueueSnackbar('Verify success!');
			await login(defaultLoginValues.email, defaultLoginValues.password);
			navigate(PATH_DASHBOARD.root);
		} catch (error) {
			console.error(error);
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
					!!errors.code5 ) && (
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
					Verify
				</LoadingButton>
			</Stack>
		</FormProvider>
	);
}
