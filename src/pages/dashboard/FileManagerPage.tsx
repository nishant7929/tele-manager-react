import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import { Button, Container } from '@mui/material';
// components
import ConfirmDialog from '../../components/confirm-dialog';
import { useSettingsContext } from '../../components/settings';
import { useTable } from '../../components/table';
// sections
import {
	FileGridView,
} from '../../sections/@dashboard/file';
import { useSelector } from '../../redux/store';
import { FolderType } from '../../@types/user';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function FileManagerPage() {
	const { user, isLoading } = useSelector((state) => state.user);

	const table = useTable({ defaultRowsPerPage: 10 });

	const { themeStretch } = useSettingsContext();

	const [tableData, setTableData] = useState<FolderType[]>([]);

	const [openConfirm, setOpenConfirm] = useState(false);

	const handleDeleteItem = (id: string) => {
		const deleteRow = tableData.filter((row) => row.id !== id);
		setTableData(deleteRow);
	};

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

	useEffect(() => {
		if (user) {
			setTableData(user.folders);
		}
	}, [user]);
	return (
		<>
			<Helmet>
				<title> File Manager | Zcloud</title>
			</Helmet>

			<Container maxWidth={themeStretch ? false : 'lg'}>
				<CustomBreadcrumbs
					heading="File Manager"
					links={[
						{
							name: 'Dashboard',
							href: PATH_DASHBOARD.one,
						},
						{ name: 'File Manager' },
					]}
				/>

				<FileGridView
					loading={isLoading}
					table={table}
					data={tableData}
					onDeleteItem={handleDeleteItem}
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
		</>
	);
}
