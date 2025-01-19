// @mui
import { Box, BoxProps } from '@mui/material';
// components
import { SkeletonProductItem } from '../../../components/skeleton';
//
import FileCard from './FileCard';
import { IImageData } from '../../../pages/dashboard/FileListPage';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
	files: IImageData[];
	loading: boolean;
}

export default function FileList({ files, loading, ...other }: Props) {
	return (
		<Box
			gap={1}
			display="grid"
			gridTemplateColumns={{
				xs: 'repeat(2, 1fr)',
				sm: 'repeat(3, 1fr)',
				md: 'repeat(4, 1fr)',
				lg: 'repeat(5, 1fr)',
			}}
			{...other}
		>
			{(loading ? [...Array(20)] : [...files]).map((file, index) =>
				file ? (
					<FileCard key={index} file={file} />
				) : (
					<SkeletonProductItem key={index} />
				)
			)}
		</Box>
	);
}
