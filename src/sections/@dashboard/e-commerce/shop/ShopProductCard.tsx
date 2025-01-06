// @mui
import { Box, Card } from '@mui/material';
// @types
import { IProduct } from '../../../../@types/product';
// components
import Image from '../../../../components/image';

// ----------------------------------------------------------------------

type Props = {
	product: IProduct;
};

export default function ShopProductCard({ product }: Props) {
	const { id, name, cover, price, colors, status, available, sizes, priceSale } = product;

	return (
		<Card>
			<Box sx={{ position: 'relative' }}>
				<Image alt={name} src={cover} ratio="1/1" sx={{ borderRadius: 1.5 }} />
			</Box>
		</Card>
	);
}
