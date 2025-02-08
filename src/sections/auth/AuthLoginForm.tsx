import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Autocomplete, LoadingButton } from '@mui/lab';
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { countries } from '../../assets/data';
import { Box, Popper, Stack, styled, TextField } from '@mui/material';
import { sendCodeHandler } from '../../utils/telegram';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type FormValuesProps = {
	phoneNumber: number;
};

interface CountryOption {
	code: string;
	label: string;
	phone: string;
}

interface Props {
	handleCodeSend: (__phoneNumner: string) => void;
}

export default function AuthLoginForm({ handleCodeSend }: Props) {
	const { enqueueSnackbar } = useSnackbar();
	const LoginSchema = Yup.object().shape({
		phoneNumber: Yup.string()
			.required('Phone number is required')
			.length(10, 'Phone number must be exactly 10 digits'),
	});

	const methods = useForm<FormValuesProps>({
		resolver: yupResolver(LoginSchema),
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onSubmit = async (data: FormValuesProps) => {
		try {
			const { message, success } = await sendCodeHandler(`+91 ${data.phoneNumber}`);
			if (success) {
				handleCodeSend(`+91 ${data.phoneNumber}`);
			}
			enqueueSnackbar(message, { variant: success ? 'success' : 'error' });
		} catch (error) {
			console.error(error);
			enqueueSnackbar(error, { variant: 'error' });
		}
	};

	const CustomPopper = styled(Popper)({
		width: '20% !important',
		minWidth: '300px',
	});

	const filterOptions = (options: CountryOption[], { inputValue }: { inputValue: string }) => {
		const query = inputValue.trim().toLowerCase();
		if (!query) {return options;}

		return (
			options
				.filter(({ label, code, phone }) => {
					return (
						label.toLowerCase().includes(query) ||
						code.toLowerCase().includes(query) ||
						phone.includes(query)
					);
				})
				.sort((a, b) => {
					const aExact =
						a.label.toLowerCase() === query || a.code.toLowerCase() === query || a.phone === query;
					const bExact =
						b.label.toLowerCase() === query || b.code.toLowerCase() === query || b.phone === query;
					return bExact ? 1 : aExact ? -1 : 0;
				})
		);
	};

	return (
		<FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
			<Stack direction={'row'} spacing={1}>
				<Autocomplete
					disabled
					disableClearable
					defaultValue={{ code: 'IN', label: 'India', phone: '91' }}
					autoHighlight
					options={countries}
					getOptionLabel={(option) => option.phone}
					filterOptions={filterOptions}
					renderOption={(props, option) => (
						<Box component="li" {...props} sx={{ px: '8px !important' }}>
							{option.label} ({option.code}) +{option.phone}
						</Box>
					)}
					renderInput={(params) => <TextField {...params} label="Code" />}
					PopperComponent={(props) => <CustomPopper {...props} placement="bottom-start" />}
				/>
				<RHFTextField name="phoneNumber" type="number" label="Phone Number" />
			</Stack>

			<LoadingButton
				fullWidth
				size="large"
				type="submit"
				variant="contained"
				loading={isSubmitting}
				sx={{ mt: 3 }}
			>
				Send code
			</LoadingButton>
		</FormProvider>
	);
}
