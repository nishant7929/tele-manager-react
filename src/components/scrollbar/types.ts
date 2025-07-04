import { Props } from 'simplebar-react';
// @mui
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface ScrollbarProps extends Props {
	children?: React.ReactNode;
	sx?: SxProps<Theme>;
}
