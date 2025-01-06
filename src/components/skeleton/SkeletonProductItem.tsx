// @mui
import { Card, Skeleton, CardProps } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonProductItem({ ...other }: CardProps) {
	return (
		<Card {...other}>
			<Skeleton variant="rectangular" sx={{ paddingTop: '100%' }} />
		</Card>
	);
}
