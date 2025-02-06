import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
	disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
	({ disabledLink = false, sx, ...other }, ref) => {

		// OR using local (public folder)
		// -------------------------------------------------------
		// const logo = (
		//   <Box
		//     component="img"
		//     src="/logo/logo_single.svg" => your path
		//     sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
		//   />
		// );

		const logo = (
			<Box
				ref={ref}
				component="div"
				sx={{
					width: 40,
					height: 40,
					display: 'inline-flex',
					...sx,
				}}
				{...other}
			>
				<img src={'/logo/telegram-logo-256.png'} />
			</Box>
		);

		if (disabledLink) {
			return logo;
		}

		return (
			<Link component={RouterLink} to="/" sx={{ display: 'contents' }}>
				{logo}
			</Link>
		);
	}
);

export default Logo;
