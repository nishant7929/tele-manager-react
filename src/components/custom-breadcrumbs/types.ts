// @mui
import { BreadcrumbsProps } from '@mui/material';

// ----------------------------------------------------------------------

export type BreadcrumbsLinkProps = {
	name?: string;
	href?: string;
	icon?: React.ReactElement;
};

export interface CustomBreadcrumbsProps extends BreadcrumbsProps {
	heading?: string;
	moreLink?: string[];
	activeLast?: boolean;
	action?: React.ReactNode;
	links: BreadcrumbsLinkProps[];
	isMobileView?: boolean;
}
