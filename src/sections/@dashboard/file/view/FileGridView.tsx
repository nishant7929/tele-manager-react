import { useState, useRef } from 'react';
// @mui
import { Box, Button } from '@mui/material';
// @types
import { FolderType } from '../../../../@types/user';
// components
import Iconify from '../../../../components/iconify';
import { TableProps } from '../../../../components/table';
//
import FileFolderCard from '../item/FileFolderCard';
import FileShareDialog from '../portal/FileShareDialog';
import FileActionSelected from '../portal/FileActionSelected';
import FileNewFolderDialog from '../portal/FileNewFolderDialog';
import { SkeletonProductItem } from '../../../../components/skeleton';

// ----------------------------------------------------------------------

type Props = {
	loading: boolean;
	table: TableProps;
	data: FolderType[];
	onOpenConfirm: VoidFunction;
	onDeleteItem: (__id: string) => void;
};

export default function FileGridView({ loading, table, data, onDeleteItem, onOpenConfirm }: Props) {

	const { selected, onSelectRow: onSelectItem, onSelectAllRows: onSelectAllItems } = table;

	const containerRef = useRef(null);


	const [inviteEmail, setInviteEmail] = useState('');

	const [openShare, setOpenShare] = useState(false);

	const [openUploadFile, setOpenUploadFile] = useState(false);

	const handleOpenShare = () => {
		setOpenShare(true);
	};

	const handleCloseShare = () => {
		setOpenShare(false);
	};

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
	};

	const handleChangeInvite = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInviteEmail(event.target.value);
	};

	return (
		<>
			<Box ref={containerRef}>

				<Box
					gap={3}
					display="grid"
					gridTemplateColumns={{
						xs: 'repeat(2, 1fr)',
						sm: 'repeat(3, 1fr)',
						md: 'repeat(4, 1fr)',
						lg: 'repeat(5, 1fr)',
					}}
				>
					{loading
						? [...Array(4)].map((_, index) => (
							<SkeletonProductItem sx={{ height: '140px' }} key={index} />
							  ))
						: data?.map((folder) => (
							<FileFolderCard
								key={folder.id}
								folder={folder}
								selected={selected.includes(folder.id)}
								onSelect={() => onSelectItem(folder.id)}
								onDelete={() => onDeleteItem(folder.id)}
								sx={{ maxWidth: 'auto' }}
							/>
							  ))}
				</Box>

				{!!selected?.length && (
					<FileActionSelected
						numSelected={selected.length}
						rowCount={data?.length}
						selected={selected}
						onSelectAllItems={(checked) =>
							onSelectAllItems(
								checked,
								data.map((row) => row.id)
							)
						}
						action={
							<>
								<Button
									size="small"
									color="error"
									variant="contained"
									startIcon={<Iconify icon="eva:trash-2-outline" />}
									onClick={onOpenConfirm}
									sx={{ mr: 1 }}
								>
									Delete
								</Button>

								<Button
									color="inherit"
									size="small"
									variant="contained"
									startIcon={<Iconify icon="eva:share-fill" />}
									onClick={handleOpenShare}
									sx={{
										color: (theme) =>
											theme.palette.mode === 'light' ? 'grey.800' : 'common.white',
										bgcolor: (theme) =>
											theme.palette.mode === 'light' ? 'common.white' : 'grey.800',
										'&:hover': {
											color: (theme) =>
												theme.palette.mode === 'light' ? 'grey.800' : 'common.white',
											bgcolor: (theme) =>
												theme.palette.mode === 'light' ? 'common.white' : 'grey.800',
										},
									}}
								>
									Share
								</Button>
							</>
						}
					/>
				)}
			</Box>

			<FileShareDialog
				open={openShare}
				inviteEmail={inviteEmail}
				onChangeInvite={handleChangeInvite}
				onClose={() => {
					handleCloseShare();
					setInviteEmail('');
				}}
			/>

			<FileNewFolderDialog open={openUploadFile} onClose={handleCloseUploadFile} />

		</>
	);
}
