// @mui
import { Box, Card, Checkbox } from '@mui/material';
// components
import { IImageData } from '../../../pages/dashboard/FileListPage';
import Image from '../../../components/image';
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
	file: IImageData;
	selected?: boolean;
	onSelect?: VoidFunction;
};

export default function FileCard({ file, selected, onSelect }: Props) {
	const { thumbnail, name, type } = file;

	return (
		<Card>
			<Box sx={{ position: 'relative' }}>

				<Checkbox
					checked={selected}
					onClick={onSelect}
					icon={<Iconify icon="eva:radio-button-off-fill" />}
					checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
					sx={{
						top: 5,
						left: 5,
						zIndex: 9,
						position: 'absolute',
						color: 'white',
					}}
				/>

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
