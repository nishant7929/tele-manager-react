import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Autocomplete, LoadingButton } from '@mui/lab';
// routes
// import { PATH_AUTH } from '../../routes/paths';
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { countries } from '../../assets/data';
import { Box, Stack, TextField } from '@mui/material';

// ----------------------------------------------------------------------

type FormValuesProps = {
	phoneNumber: number;
};

function countryToFlag(isoCode: string) {
	return typeof String.fromCodePoint !== 'undefined'
		? isoCode
			.toUpperCase()
			.replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
		: isoCode;
}

export default function AuthResetPasswordForm() {
	const navigate = useNavigate();
	const ResetPasswordSchema = Yup.object().shape({
		phoneNumber: Yup.string()
		  .required('Phone number is required')
		  .length(10, 'Phone number must be exactly 10 digits'),
	  });

	const methods = useForm<FormValuesProps>({
		resolver: yupResolver(ResetPasswordSchema),
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onSubmit = async() => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			navigate('/verify');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
			<Stack direction={'row'} spacing={1}>
				<Autocomplete
					disableClearable
					disabled
					defaultValue={{ code: 'IN', label: 'India', phone: '91' }}
					autoHighlight
					options={countries}
					getOptionLabel={(option) => option.phone}
					renderOption={(props, option) => (
						<Box component="li" {...props} sx={{ px: '8px !important' }}>
							<Box component="span" sx={{ flexShrink: 0, mr: 2, fontSize: 22 }}>
								{countryToFlag(option.code)}
							</Box>
							{option.label} ({option.code}) +{option.phone}
						</Box>
					)}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Code"
						/>
					)}
				/>
				<RHFTextField name="phoneNumber" type='number' label="Phone Number" />
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
