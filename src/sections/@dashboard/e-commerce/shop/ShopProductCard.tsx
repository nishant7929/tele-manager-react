// @mui
import { Box, Card } from '@mui/material';
// components
import Image from '../../../../components/image';
import { IImageData } from '../../../../pages/dashboard/FileListPage';

// ----------------------------------------------------------------------

type Props = {
	product: IImageData;
};

export default function ShopProductCard({ product }: Props) {
	const { thumbnail, name } = product;

	return (
		<Card>
			<Box sx={{ position: 'relative' }}>
				<Image alt={name} src={thumbnail || ''} ratio="1/1" sx={{ borderRadius: 1.5 }} />
			</Box>
		</Card>
	);
}
