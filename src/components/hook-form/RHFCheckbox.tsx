// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import {
	Checkbox,
	FormLabel,
	FormGroup,
	FormControl,
	FormHelperText,
	FormControlLabel,
	FormControlLabelProps,
} from '@mui/material';

// ----------------------------------------------------------------------

interface RHFCheckboxProps extends Omit<FormControlLabelProps, 'control'> {
	name: string;
	helperText?: React.ReactNode;
}

export function RHFCheckbox({ name, helperText, ...other }: RHFCheckboxProps) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<div>
					<FormControlLabel control={<Checkbox {...field} checked={field.value} />} {...other} />

					{(!!error || helperText) && (
						<FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
					)}
				</div>
			)}
		/>
	);
}

// ----------------------------------------------------------------------

interface RHFMultiCheckboxProps extends Omit<FormControlLabelProps, 'control' | 'label'> {
	name: string;
	options: { label: string; value: any }[];
	row?: boolean;
	label?: string;
	spacing?: number;
	helperText?: React.ReactNode;
}

export function RHFMultiCheckbox({
	row,
	name,
	label,
	options,
	spacing,
	helperText,
	...other
}: RHFMultiCheckboxProps) {
	const { control } = useFormContext();

	const getSelected = (selectedItems: string[], item: string) =>
		selectedItems.includes(item)
			? selectedItems.filter((value) => value !== item)
			: [...selectedItems, item];

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<FormControl component="fieldset">
					{label && (
						<FormLabel component="legend" sx={{ typography: 'body2' }}>
							{label}
						</FormLabel>
					)}

					<FormGroup
						sx={{
							...(row && {
								flexDirection: 'row',
							}),
							'& .MuiFormControlLabel-root': {
								'&:not(:last-of-type)': {
									mb: spacing || 0,
								},
								...(row && {
									mr: 0,
									'&:not(:last-of-type)': {
										mr: spacing || 2,
									},
								}),
							},
						}}
					>
						{options.map((option) => (
							<FormControlLabel
								key={option.value}
								control={
									<Checkbox
										checked={field.value.includes(option.value)}
										onChange={() => field.onChange(getSelected(field.value, option.value))}
									/>
								}
								label={option.label}
								{...other}
							/>
						))}
					</FormGroup>

					{(!!error || helperText) && (
						<FormHelperText error={!!error} sx={{ mx: 0 }}>
							{error ? error?.message : helperText}
						</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	);
}
