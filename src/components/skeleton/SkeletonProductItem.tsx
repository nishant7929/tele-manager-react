// @mui
import { Card, Skeleton, CardProps } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonProductItem({ ...other }: CardProps) {
	return (
		<Card sx={{ borderRadius: '10px' }} {...other}>
			<Skeleton variant="rectangular" sx={{ paddingTop: '100%' }} />
		</Card>
	);
}
