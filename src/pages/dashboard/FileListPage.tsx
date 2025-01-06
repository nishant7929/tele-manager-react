import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
// @mui
import { Container, Typography, Stack } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getProducts } from '../../redux/slices/product';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
// sections
import {
	ShopProductList,
} from '../../sections/@dashboard/e-commerce/shop';

// ----------------------------------------------------------------------

export default function FileListPage() {
	const { themeStretch } = useSettingsContext();

	const dispatch = useDispatch();

	const { products } = useSelector((state) => state.product);

	const isDefault = true;

	useEffect(() => {
		dispatch(getProducts());
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title> Files | Zcloud</title>
			</Helmet>

			<Container maxWidth={themeStretch ? false : 'lg'}>
				<CustomBreadcrumbs
					heading="Files"
					links={[
						{ name: 'Dashboard', href: PATH_DASHBOARD.root },
						{ name: 'Files' },
					]}
				/>

				<Stack sx={{ mb: 3 }}>
					{!isDefault && (
						<>
							<Typography variant="body2" gutterBottom>
								<strong>{products.length}</strong>
									&nbsp;Products found
							</Typography>
						</>
					)}
				</Stack>

				<ShopProductList products={products} loading={!products.length && isDefault} />

			</Container>
		</>
	);
}
