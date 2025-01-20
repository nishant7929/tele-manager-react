// @mui
import { Box, Card } from '@mui/material';
// components
import { IImageData } from '../../../pages/dashboard/FileListPage';
import Image from '../../../components/image';
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
	file: IImageData;
};

export default function FileCard({ file }: Props) {
	const { thumbnail, name, type } = file;

	return (
		<Card>
			<Box sx={{ position: 'relative' }}>
				{type?.includes('video') && (
					<Label
						sx={{
							top: 16,
							right: 16,
							zIndex: 9,
							position: 'absolute',
							color: 'white',
						}}
					>
						<Iconify icon="ph:play-circle-bold" />
					</Label>
				)}
				<Image alt={name} src={thumbnail || ''} ratio="1/1" sx={{ borderRadius: 1.5 }} />
			</Box>
		</Card>
	);
}
