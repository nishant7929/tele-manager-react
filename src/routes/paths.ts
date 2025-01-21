// ----------------------------------------------------------------------

export function path(root: string, sublink: string) {
	return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
	login: '/login',
};

export const PATH_DASHBOARD = {
	root: ROOTS_DASHBOARD,
	folders: '/folders',
	folder: '/folder',
	telegram: '/telegram'
};
