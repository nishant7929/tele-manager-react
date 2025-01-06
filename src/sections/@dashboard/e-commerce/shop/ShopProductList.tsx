// @mui
import { Box, BoxProps } from '@mui/material';
// @type
import { IProduct } from '../../../../@types/product';
// components
import { SkeletonProductItem } from '../../../../components/skeleton';
//
import ShopProductCard from './ShopProductCard';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
	products: IProduct[];
	loading: boolean;
}

export default function ShopProductList({ products, loading, ...other }: Props) {
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
			{(loading ? [...Array(12)] : [...products, ...products, ...products, ...products, ...products]).map((product, index) =>
				product ? (
					<ShopProductCard key={index} product={product} />
				) : (
					<SkeletonProductItem key={index} />
				)
			)}
		</Box>
	);
}
