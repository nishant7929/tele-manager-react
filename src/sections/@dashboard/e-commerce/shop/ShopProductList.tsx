// @mui
import { Box, BoxProps } from '@mui/material';
// components
import { SkeletonProductItem } from '../../../../components/skeleton';
//
import ShopProductCard from './ShopProductCard';
import { IImageData } from '../../../../pages/dashboard/FileListPage';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
	products: IImageData[];
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
			{(loading ? [...Array(20)] : [...products]).map((product, index) =>
				product ? (
					<ShopProductCard key={index} product={product} />
				) : (
					<SkeletonProductItem key={index} />
				)
			)}
		</Box>
	);
}
