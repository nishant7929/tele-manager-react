import { useState, useRef } from 'react';
// @mui
import { Collapse, Box, Button } from '@mui/material';
// @types
import { FolderType } from '../../../../@types/user';
// components
import Iconify from '../../../../components/iconify';
import { TableProps } from '../../../../components/table';
//
import FilePanel from '../FilePanel';
import FileFolderCard from '../item/FileFolderCard';
import FileShareDialog from '../portal/FileShareDialog';
import FileActionSelected from '../portal/FileActionSelected';
import FileNewFolderDialog from '../portal/FileNewFolderDialog';
import { userModel } from '../../../../utils/firebase';
import { useDispatch, useSelector } from '../../../../redux/store';
import { updateUser } from '../../../../redux/slices/user';
import { SkeletonProductItem } from '../../../../components/skeleton';
import { uuidv4V2 } from '../../../../utils/uuidv4';

// ----------------------------------------------------------------------

type Props = {
	loading: boolean;
	table: TableProps;
	data: FolderType[];
	onOpenConfirm: VoidFunction;
	onDeleteItem: (__id: string) => void;
};

export default function FileGridView({ loading, table, data, onDeleteItem, onOpenConfirm }: Props) {
	const { user } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const { selected, onSelectRow: onSelectItem, onSelectAllRows: onSelectAllItems } = table;

	const containerRef = useRef(null);

	const [folderName, setFolderName] = useState('');

	const [inviteEmail, setInviteEmail] = useState('');

	const [openShare, setOpenShare] = useState(false);

	const [openNewFolder, setOpenNewFolder] = useState(false);

	const [openUploadFile, setOpenUploadFile] = useState(false);

	const [collapseFolders, setCollapseFolders] = useState(false);

	const handleOpenShare = () => {
		setOpenShare(true);
	};

	const handleCloseShare = () => {
		setOpenShare(false);
	};

	const handleOpenNewFolder = () => {
		setOpenNewFolder(true);
	};

	const handleCloseNewFolder = () => {
		setOpenNewFolder(false);
	};

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
	};

	const handleChangeInvite = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInviteEmail(event.target.value);
	};

	const handleCreateNewFolder = async() => {
		handleCloseNewFolder();
		setFolderName('');
		const newFolder = {
			name: folderName,
			id: uuidv4V2(),
			totalFiles: 0,
			size: '0',
			isFavorited: false,
		};
		if (user) {
			const newUser = await userModel.findByIdAndUpdate(user.id, {
				...user,
				folders: user.folders ? [...user.folders, newFolder] : [newFolder],
			});
			dispatch(updateUser(newUser));
		}
	};

	return (
		<>
			<Box ref={containerRef}>
				<FilePanel
					title="Your Folders"
					subTitle={`${data?.length || 0} folders`}
					onOpen={handleOpenNewFolder}
					collapse={collapseFolders}
					onCollapse={() => setCollapseFolders(!collapseFolders)}
				/>

				<Collapse in={!collapseFolders} unmountOnExit>
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
				</Collapse>

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
