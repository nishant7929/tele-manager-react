import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import { Button, Container, Typography } from '@mui/material';
// components
import ConfirmDialog from '../../components/confirm-dialog';
import { useSettingsContext } from '../../components/settings';
import { useTable } from '../../components/table';
import Iconify from '../../components/iconify';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import { FileGridView, FileNewFolderDialog } from '../../sections/@dashboard/file';
import { useDispatch, useSelector } from '../../redux/store';
import { FolderType } from '../../@types/user';
import { PATH_DASHBOARD } from '../../routes/paths';
import { uuidv4V2 } from '../../utils/uuidv4';
import { userModel } from '../../utils/firebase';
import { updateUser } from '../../redux/slices/user';
import useResponsive from '../../hooks/useResponsive';

// ----------------------------------------------------------------------

export default function FileManagerPage() {
	const isMobile = useResponsive('down', 'sm');
	const { user, isLoading } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const table = useTable({ defaultRowsPerPage: 10 });

	const { themeStretch } = useSettingsContext();

	const [tableData, setTableData] = useState<FolderType[]>([]);

	const [openConfirm, setOpenConfirm] = useState(false);

	const [openNewFolder, setOpenNewFolder] = useState(false);

	const [folderName, setFolderName] = useState('');

	const handleDeleteItems = (selected: string[]) => {
		const deleteRows = tableData.filter((row) => !selected.includes(row.id));
		setTableData(deleteRows);
	};

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	const handleOpenNewFolder = () => {
		setOpenNewFolder(true);
	};

	const handleCloseNewFolder = () => {
		setOpenNewFolder(false);
	};

	const handleCreateNewFolder = async () => {
		handleCloseNewFolder();
		setFolderName('');
		const newFolder: FolderType = {
			name: folderName,
			id: uuidv4V2(),
			createdAt: new Date().toISOString(),
		};
		if (user) {
			const newUser = await userModel.findByIdAndUpdate(user.uid, {
				...user,
				folders: user.folders ? [...user.folders, newFolder] : [newFolder],
			});
			dispatch(updateUser(newUser));
		}
	};

	useEffect(() => {
		if (user) {
			setTableData(user.folders);
		}
	}, [user]);
	return (
		<>
			<Helmet>
				<title> Folders | Tele Manager</title>
			</Helmet>

			<Container maxWidth={themeStretch ? false : 'lg'}>
				<CustomBreadcrumbs
					isMobileView={isMobile}
					heading="Folders"
					links={[
						{
							name: 'Home',
							href: PATH_DASHBOARD.folders,
						},
						{ name: 'Folders' },
					]}
					action={
						<Button
							variant="contained"
							startIcon={<Iconify icon="eva:plus-fill" />}
							onClick={handleOpenNewFolder}
						>
							New folder
						</Button>
					}
				/>
				{user && !user?.folders.length && (
					<Typography sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
						Create your first folder to start uploading files.
					</Typography>
				)}
				<FileGridView
					loading={isLoading}
					table={table}
					data={tableData}
					onOpenConfirm={handleOpenConfirm}
				/>
			</Container>

			<ConfirmDialog
				open={openConfirm}
				onClose={handleCloseConfirm}
				title="Delete"
				content={
					<>
						Are you sure want to delete <strong> {table.selected.length} </strong> items?
					</>
				}
				action={
					<Button
						variant="contained"
						color="error"
						onClick={() => {
							handleDeleteItems(table.selected);
							handleCloseConfirm();
						}}
					>
						Delete
					</Button>
				}
			/>

			<FileNewFolderDialog
				open={openNewFolder}
				onClose={handleCloseNewFolder}
				title="New Folder"
				onCreate={handleCreateNewFolder}
				folderName={folderName}
				onChangeFolderName={(event) => setFolderName(event.target.value)}
			/>
		</>
	);
}
