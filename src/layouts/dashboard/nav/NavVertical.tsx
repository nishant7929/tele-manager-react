import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Stack, Drawer } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// config
import { NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';
//
import navConfig from './config-navigation';
import NavAccount from './NavAccount';
import NavToggleButton from './NavToggleButton';
import { useSelector } from '../../../redux/store';

// ----------------------------------------------------------------------

type Props = {
	openNav: boolean;
	onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
	const { pathname } = useLocation();
	const { user } = useSelector((state) => state.user);
	const isDesktop = useResponsive('up', 'lg');

	useEffect(() => {
		if (openNav) {
			onCloseNav();
		}
	}, [pathname]);

	const renderContent = (
		<Scrollbar
			sx={{
				height: 1,
				'& .simplebar-content': {
					height: 1,
					display: 'flex',
					flexDirection: 'column',
				},
			}}
		>
			<Stack
				spacing={3}
				sx={{
					pt: 3,
					pb: 2,
					px: 2.5,
					flexShrink: 0,
				}}
			>
				<Logo />

				<NavAccount />
			</Stack>

			<NavSectionVertical data={navConfig(user?.folders)} />

			<Box sx={{ flexGrow: 1 }} />

			{/* <NavDocs /> */}
		</Scrollbar>
	);

	return (
		<Box
			component="nav"
			sx={{
				flexShrink: { lg: 0 },
				width: { lg: NAV.W_DASHBOARD },
			}}
		>
			<NavToggleButton />

			{isDesktop ? (
				<Drawer
					open
					variant="permanent"
					PaperProps={{
						sx: {
							zIndex: 0,
							width: NAV.W_DASHBOARD,
							bgcolor: 'transparent',
							borderRightStyle: 'dashed',
						},
					}}
				>
					{renderContent}
				</Drawer>
			) : (
				<Drawer
					open={openNav}
					onClose={onCloseNav}
					ModalProps={{
						keepMounted: true,
					}}
					PaperProps={{
						sx: {
							width: NAV.W_DASHBOARD,
						},
					}}
				>
					{renderContent}
				</Drawer>
			)}
		</Box>
	);
}
