import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import { Button, Container } from '@mui/material';
// utils
import { fTimestamp } from '../../utils/formatTime';
// _mock_
import { _allFiles } from '../../_mock/arrays';
// @types
import { IFile } from '../../@types/file';
// components
import ConfirmDialog from '../../components/confirm-dialog';
import { fileFormat } from '../../components/file-thumbnail';
import { useSettingsContext } from '../../components/settings';
import { useTable, getComparator } from '../../components/table';
import { useDateRangePicker } from '../../components/date-range-picker';
// sections
import {
	FileListView,
	FileGridView,
	FileNewFolderDialog,
} from '../../sections/@dashboard/file';

// ----------------------------------------------------------------------

export default function FileManagerPage() {
	const table = useTable({ defaultRowsPerPage: 10 });

	const {
		startDate,
		endDate,
		isError,
	} = useDateRangePicker(null, null);

	const { themeStretch } = useSettingsContext();

	const [view] = useState('grid');

	const [filterName] = useState('');

	const [tableData, setTableData] = useState(_allFiles);

	const [filterType] = useState<string[]>([]);

	const [openConfirm, setOpenConfirm] = useState(false);

	const [openUploadFile, setOpenUploadFile] = useState(false);

	const dataFiltered = applyFilter({
		inputData: tableData,
		comparator: getComparator(table.order, table.orderBy),
		filterName,
		filterType,
		filterStartDate: startDate,
		filterEndDate: endDate,
		isError: !!isError,
	});

	const dataInPage = dataFiltered.slice(
		table.page * table.rowsPerPage,
		table.page * table.rowsPerPage + table.rowsPerPage
	);

	const isNotFound =
		(!dataFiltered.length && !!filterName) ||
		(!dataFiltered.length && !!filterType) ||
		(!dataFiltered.length && !!endDate && !!startDate);

	const handleDeleteItem = (id: string) => {
		const { page, setPage, setSelected } = table;
		const deleteRow = tableData.filter((row) => row.id !== id);
		setSelected([]);
		setTableData(deleteRow);

		if (page > 0) {
			if (dataInPage.length < 2) {
				setPage(page - 1);
			}
		}
	};

	const handleDeleteItems = (selected: string[]) => {
		const { page, rowsPerPage, setPage, setSelected } = table;
		const deleteRows = tableData.filter((row) => !selected.includes(row.id));
		setSelected([]);
		setTableData(deleteRows);

		if (page > 0) {
			if (selected.length === dataInPage.length) {
				setPage(page - 1);
			} else if (selected.length === dataFiltered.length) {
				setPage(0);
			} else if (selected.length > dataInPage.length) {
				const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
				setPage(newPage);
			}
		}
	};

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	// const handleOpenUploadFile = () => {
	// 	setOpenUploadFile(true);
	// };

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
	};

	return (
		<>
			<Helmet>
				<title> File Manager | Zcloud</title>
			</Helmet>

			<Container maxWidth={themeStretch ? false : 'lg'}>
				{/* <CustomBreadcrumbs
					heading="File Manager"
					links={[
						{
							name: 'Dashboard',
							href: PATH_DASHBOARD.root,
						},
						{ name: 'File Manager' },
					]}
					action={
						<Button
							variant="contained"
							startIcon={<Iconify icon="eva:cloud-upload-fill" />}
							onClick={handleOpenUploadFile}
						>
							Upload
						</Button>
					}
				/> */}

				{view === 'list' ? (
					<FileListView
						table={table}
						tableData={tableData}
						dataFiltered={dataFiltered}
						onDeleteRow={handleDeleteItem}
						isNotFound={isNotFound}
						onOpenConfirm={handleOpenConfirm}
					/>
				) : (
					<FileGridView
						table={table}
						data={tableData}
						dataFiltered={dataFiltered}
						onDeleteItem={handleDeleteItem}
						onOpenConfirm={handleOpenConfirm}
					/>
				)}
			</Container>

			<FileNewFolderDialog open={openUploadFile} onClose={handleCloseUploadFile} />

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

// ----------------------------------------------------------------------

function applyFilter({
	inputData,
	comparator,
	filterName,
	filterType,
	filterStartDate,
	filterEndDate,
	isError,
}: {
	inputData: IFile[];
	comparator: (__a: any, __b: any) => number;
	filterName: string;
	filterType: string[];
	filterStartDate: Date | null;
	filterEndDate: Date | null;
	isError: boolean;
}) {
	const stabilizedThis = inputData.map((el, index) => [el, index] as const);

	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});

	inputData = stabilizedThis.map((el) => el[0]);

	if (filterName) {
		inputData = inputData.filter(
			(file) => file.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
		);
	}

	if (filterType.length) {
		inputData = inputData.filter((file) => filterType.includes(fileFormat(file.type)));
	}

	if (filterStartDate && filterEndDate && !isError) {
		inputData = inputData.filter(
			(file) =>
				fTimestamp(file.dateCreated) >= fTimestamp(filterStartDate) &&
				fTimestamp(file.dateCreated) <= fTimestamp(filterEndDate)
		);
	}

	return inputData;
}
