import { forwardRef } from 'react';
// @mui
import { Typography, Link } from '@mui/material';
//
import { TextMaxLineProps } from './types';
import useTypography from './useTypography';

// ----------------------------------------------------------------------

const TextMaxLine = forwardRef<HTMLAnchorElement, TextMaxLineProps>(
	({ asLink, variant = 'body1', line = 2, persistent = false, children, sx, ...other }, ref) => {
		const { lineHeight } = useTypography(variant);

		const styles = {
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			display: '-webkit-box',
			WebkitLineClamp: line,
			WebkitBoxOrient: 'vertical',
			...(persistent && {
				height: lineHeight * line,
			}),
			...sx,
		} as const;

		if (asLink) {
			return (
				<Link color="inherit" ref={ref} variant={variant} sx={{ ...styles }} {...other}>
					{children}
				</Link>
			);
		}

		return (
			<Typography ref={ref} variant={variant} sx={{ ...styles }} {...other}>
				{children}
			</Typography>
		);
	}
);

export default TextMaxLine;
