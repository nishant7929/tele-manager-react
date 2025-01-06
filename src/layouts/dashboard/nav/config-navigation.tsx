// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
	<SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

export const ICONS = {
	user: icon('ic_user'),
	ecommerce: icon('ic_ecommerce'),
	analytics: icon('ic_analytics'),
	dashboard: icon('ic_dashboard'),
	folder: icon('ic_folder'),
};

const navConfig = [
	// GENERAL
	// ----------------------------------------------------------------------
	{
		subheader: '',
		items: [
			{ title: 'Folders', path: PATH_DASHBOARD.one, icon: ICONS.folder },
			{ title: 'Telegram', path: PATH_DASHBOARD.telegram, icon: ICONS.user },
		],
	},
];

export default navConfig;
