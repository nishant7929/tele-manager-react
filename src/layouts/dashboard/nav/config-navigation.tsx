// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';
import { FolderType } from '../../../@types/user';

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
	menuItem: icon('ic_menu_item'),
};

type MenuItem = {
	title: string;
	path: string;
	children?: MenuItem[];
};

function transformFoldersToMenu(folders: FolderType[]): MenuItem[] {
	return folders.map((folder) => {
		const menuItem: MenuItem = {
			title: folder.name,
			path: `/folder/${folder.id}`,
		};

		if (folder.folders?.length) {
			menuItem.children = transformFoldersToMenu(folder.folders);
		}

		return menuItem;
	});
}

export const navConfig = (folders: FolderType[] = []) => {
	return [
		{
			subheader: '',
			items: [
				{
					title: 'Folders',
					path: PATH_DASHBOARD.folders,
					icon: ICONS.folder,
					children: transformFoldersToMenu(folders),
				},
			]
		},

	];
};

export default navConfig;
