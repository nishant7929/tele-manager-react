import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
	Box,
	Card,
	Stack,
	Button,
	Divider,
	MenuItem,
	CardProps,
	IconButton,
	Skeleton,
} from '@mui/material';
import { PATH_DASHBOARD } from '../../../../routes/paths';
// @types
import { FolderType } from '../../../../@types/user';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import TextMaxLine from '../../../../components/text-max-line';
import ConfirmDialog from '../../../../components/confirm-dialog';
//
import FileNewFolderDialog from '../portal/FileNewFolderDialog';
import { useDispatch, useSelector } from '../../../../redux/store';
import { deleteFoldersById, getAllFolderIds, userModel } from '../../../../utils/firebase';
import { updateUser } from '../../../../redux/slices/user';
import { useUserContext } from '../../../../auth/useUserContext';
import { formatBytes } from '../../../../utils/formatNumber';
import { deleteSavedMessages } from '../../../../utils/telegram';

// ----------------------------------------------------------------------

interface Props extends CardProps {
	folder: FolderType;
	selected?: boolean;
	onSelect?: VoidFunction;
	onDelete?: VoidFunction;
}

export default function FileFolderCard({ folder, selected, sx, ...other }: Props) {
	const { tgMessages, isTgLoading } = useUserContext();

	const { user } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [showCheckbox, setShowCheckbox] = useState(false);

	const [openConfirm, setOpenConfirm] = useState(false);

	const [folderName, setFolderName] = useState(folder.name);

	const [openEditFolder, setOpenEditFolder] = useState(false);

	const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

	const items = useMemo(() => {
		const folderIds = getAllFolderIds(user?.folders || [], folder.id);
		return tgMessages.filter((message) => {
			return folderIds.some((id) => message.message.includes(id));
		});
	}, [tgMessages, folder, location.pathname]);

	const totalSize = useMemo(() => {
		return items?.reduce((acc: number, message: any) => {
			const mediaSize = message.media?.document?.size ? parseInt(message.media.document.size) : 0;
			return acc + mediaSize;
		}, 0);
	}, [items]);

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	const handleShowCheckbox = () => {
		setShowCheckbox(true);
	};

	const handleHideCheckbox = () => {
		setShowCheckbox(false);
	};

	const handleOpenEditFolder = () => {
		setOpenEditFolder(true);
	};

	const handleCloseEditFolder = () => {
		setOpenEditFolder(false);
	};

	const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
		setOpenPopover(event.currentTarget);
	};

	const handleClosePopover = () => {
		setOpenPopover(null);
	};

	const handleDeleteItem = async () => {
		const folderIds = getAllFolderIds(user?.folders || [], folder.id);
		const ids = tgMessages.filter((message) => {
			return folderIds.some((id) => message.message.includes(id));
		});

		const isDeleted = await deleteSavedMessages(ids.map((item) => item.id));
		if (user && isDeleted) {
			const newUser = await userModel.findByIdAndUpdate(user.uid, {
				...user,
				folders: deleteFoldersById(user.folders, folderIds),
			});
			dispatch(updateUser(newUser));
		}
	};

	const updatedFolders = (
		folders: FolderType[],
		targetId: string,
		newName: string
	): FolderType[] => {
		return folders.map((folder) => {
			if (folder.id === targetId) {
				return {
					...folder,
					name: newName,
					updatedAt: new Date().toISOString(),
				};
			} else if (folder.folders?.length) {
				return {
					...folder,
					folders: updatedFolders(folder.folders, targetId, newName),
				};
			}
			return folder;
		});
	};

	const handleUpdateFolder = async () => {
		handleCloseEditFolder();
		setFolderName(folderName);
		if (user) {
			const newUser = await userModel.findByIdAndUpdate(user.uid, {
				...user,
				folders: updatedFolders(user.folders, folder.id, folderName),
			});
			dispatch(updateUser(newUser));
		}
	};

	return (
		<>
			<Card
				onClick={() => navigate(`${PATH_DASHBOARD.folder}/${folder.id}`)}
				onMouseEnter={handleShowCheckbox}
				onMouseLeave={handleHideCheckbox}
				sx={{
					p: 2.5,
					width: 1,
					maxWidth: 222,
					boxShadow: 0,
					bgcolor: 'background.default',
					border: (theme) => `1px solid ${theme.palette.divider}`,
					...((showCheckbox || selected) && {
						// borderColor: 'transparent',
						// bgcolor: 'background.paper',
						// boxShadow: (theme) => theme.customShadows.z20,
						cursor: 'pointer',
					}),
					...sx,
				}}
				{...other}
			>
				<Stack
					onClick={(e) => e.stopPropagation()}
					direction="row"
					alignItems="center"
					sx={{ top: 8, right: 8, position: 'absolute' }}
				>
					<IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
						<Iconify icon="eva:more-vertical-fill" />
					</IconButton>
				</Stack>

				<Box
					component="img"
					src="/assets/icons/files/ic_folder.svg"
					sx={{ width: 40, height: 40 }}
				/>

				<TextMaxLine variant="h6" sx={{ mt: 1, mb: 0.5 }}>
					{folder.name}
				</TextMaxLine>
				{isTgLoading ? (
					<Skeleton variant="rounded" sx={{ width: 1 }} />
				) : (
					<Stack
						direction="row"
						alignItems="center"
						spacing={0.75}
						sx={{ typography: 'caption', color: 'text.disabled' }}
					>
						<Box> {items?.length} files </Box>

						<Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'currentColor' }} />

						<Box> {formatBytes(totalSize)} </Box>
					</Stack>
				)}
			</Card>

			<MenuPopover
				open={openPopover}
				onClose={handleClosePopover}
				arrow="right-top"
				sx={{ width: 160 }}
			>

				<MenuItem
					onClick={() => {
						handleClosePopover();
						handleOpenEditFolder();
					}}
				>
					<Iconify icon="eva:edit-fill" />
					Edit
				</MenuItem>

				<Divider sx={{ borderStyle: 'dashed' }} />

				<MenuItem
					onClick={() => {
						handleOpenConfirm();
						handleClosePopover();
					}}
					sx={{ color: 'error.main' }}
				>
					<Iconify icon="eva:trash-2-outline" />
					Delete
				</MenuItem>
			</MenuPopover>

			<FileNewFolderDialog
				open={openEditFolder}
				onClose={handleCloseEditFolder}
				title="Edit Folder"
				onUpdate={handleUpdateFolder}
				folderName={folderName}
				onChangeFolderName={(event) => setFolderName(event.target.value)}
			/>

			<ConfirmDialog
				open={openConfirm}
				onClose={handleCloseConfirm}
				title="Delete"
				content="Are you sure want to delete?"
				action={
					<Button variant="contained" color="error" onClick={handleDeleteItem}>
						Delete
					</Button>
				}
			/>
		</>
	);
}
