// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Switch, FormControlLabel, FormControlLabelProps, FormHelperText } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends Omit<FormControlLabelProps, 'control'> {
	name: string;
	helperText?: React.ReactNode;
}

export default function RHFSwitch({ name, helperText, ...other }: Props) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<div>
					<FormControlLabel control={<Switch {...field} checked={field.value} />} {...other} />

					{(!!error || helperText) && (
						<FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
					)}
				</div>
			)}
		/>
	);
}
