import { useDropzone } from 'react-dropzone';
// @mui
import { Box, Stack, IconButton, Typography, StackProps } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
// assets
import { UploadIllustration } from '../../assets/illustrations';
//
import Iconify from '../iconify';
//
import { UploadProps } from './types';
import RejectionFiles from './errors/RejectionFiles';
import MultiFilePreview from './preview/MultiFilePreview';
import SingleFilePreview from './preview/SingleFilePreview';

// ----------------------------------------------------------------------

const StyledDropZone = styled('div')(({ theme }) => ({
	outline: 'none',
	cursor: 'pointer',
	overflow: 'hidden',
	position: 'relative',
	padding: theme.spacing(5),
	borderRadius: theme.shape.borderRadius,
	transition: theme.transitions.create('padding'),
	backgroundColor: theme.palette.background.neutral,
	border: `1px dashed ${alpha(theme.palette.grey[500], 0.32)}`,
	'&:hover': {
		opacity: 0.72,
	},
}));

// ----------------------------------------------------------------------

export default function Upload({
	disabled,
	multiple = false,
	error,
	helperText,
	//
	file,
	onDelete,
	//
	files,
	thumbnail,
	onRemove,
	sx,
	...other
}: UploadProps) {
	const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
		multiple,
		disabled,
		maxSize: 2147483648,
		...other,
	});

	const hasFile = !!file && !multiple;

	const hasFiles = files && multiple && files.length > 0;

	const isError = isDragReject || !!error;

	return (
		<Box sx={{ width: 1, position: 'relative', ...sx }}>
			{!hasFiles && (
				<StyledDropZone
					{...getRootProps()}
					sx={{
						...(isDragActive && {
							opacity: 0.72,
						}),
						...(isError && {
							color: 'error.main',
							bgcolor: 'error.lighter',
							borderColor: 'error.light',
						}),
						...(disabled && {
							opacity: 0.48,
							pointerEvents: 'none',
						}),
						...(hasFile && {
							padding: '12% 0',
						}),
					}}
				>
					<input {...getInputProps()} />

					<Placeholder
						sx={{
							...(hasFile && {
								opacity: 0,
							}),
						}}
					/>

					{hasFile && <SingleFilePreview file={file} />}
				</StyledDropZone>
			)}

			{helperText && helperText}

			<RejectionFiles fileRejections={fileRejections} />

			{hasFile && onDelete && (
				<IconButton
					size="small"
					onClick={onDelete}
					sx={{
						top: 16,
						right: 16,
						zIndex: 9,
						position: 'absolute',
						color: (theme) => alpha(theme.palette.common.white, 0.8),
						bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
						'&:hover': {
							bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
						},
					}}
				>
					<Iconify icon="eva:close-fill" width={18} />
				</IconButton>
			)}

			{hasFiles && (
				<>
					<Box sx={{ my: 3 }}>
						<MultiFilePreview files={files} thumbnail={thumbnail} onRemove={onRemove} />
					</Box>
				</>
			)}
		</Box>
	);
}

// ----------------------------------------------------------------------

function Placeholder({ sx, ...other }: StackProps) {
	return (
		<Stack
			spacing={5}
			alignItems="center"
			justifyContent="center"
			direction={{
				xs: 'column',
				md: 'row',
			}}
			sx={{
				width: 1,
				textAlign: {
					xs: 'center',
					md: 'left',
				},
				...sx,
			}}
			{...other}
		>
			<UploadIllustration sx={{ width: 220 }} />

			<div>
				<Typography gutterBottom variant="h5">
					Drop or Select file
				</Typography>

				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					Drop files here or click
					<Typography
						variant="body2"
						component="span"
						sx={{
							mx: 0.5,
							color: 'primary.main',
							textDecoration: 'underline',
						}}
					>
						browse
					</Typography>
					thorough your machine
				</Typography>
			</div>
		</Stack>
	);
}
