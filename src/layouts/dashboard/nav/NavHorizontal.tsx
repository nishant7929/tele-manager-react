import { memo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { AppBar, Box, BoxProps, Toolbar } from '@mui/material';
// config
import { HEADER } from '../../../config-global';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// components
import { NavSectionHorizontal } from '../../../components/nav-section';
//
import navConfig from './config-navigation';
import { useSelector } from '../../../redux/store';

// ----------------------------------------------------------------------

function NavHorizontal() {
	const { user } = useSelector((state) => state.user);
	const theme = useTheme();

	return (
		<AppBar
			component="nav"
			color="transparent"
			sx={{
				boxShadow: 0,
				top: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
			}}
		>
			<Toolbar
				sx={{
					...bgBlur({
						color: theme.palette.background.default,
					}),
				}}
			>
				<NavSectionHorizontal data={navConfig(user?.folders)} />
			</Toolbar>

			<Shadow />
		</AppBar>
	);
}

export default memo(NavHorizontal);

// ----------------------------------------------------------------------

function Shadow({ sx, ...other }: BoxProps) {
	return (
		<Box
			sx={{
				left: 0,
				right: 0,
				bottom: 0,
				height: 24,
				zIndex: -1,
				width: 1,
				m: 'auto',
				borderRadius: '50%',
				position: 'absolute',
				boxShadow: (theme) => theme.customShadows.z8,
				...sx,
			}}
			{...other}
		/>
	);
}
