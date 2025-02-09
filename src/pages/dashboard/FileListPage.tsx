import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { Api } from 'telegram';
import InfiniteScroll from 'react-infinite-scroll-component';
// @mui
import { Container, Button, CircularProgress, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';
import { useTable } from '../../components/table';
import ConfirmDialog from '../../components/confirm-dialog';
// sections
import { FileList } from '../../sections/@dashboard/file-manager';
import FileUploadDialog from '../../sections/@dashboard/file/portal/FileUploadDialog';
import { useUserContext } from '../../auth/useUserContext';
import { deleteSavedMessages, getTelegramClient } from '../../utils/telegram';
import { formatBytes } from '../../utils/formatNumber';
import { useDispatch, useSelector } from '../../redux/store';
import { FolderType } from '../../@types/user';
import { FileGridView, FileNewFolderDialog } from '../../sections/@dashboard/file';
import { updateUser } from '../../redux/slices/user';
import { uuidv4V2 } from '../../utils/uuidv4';
import { userModel } from '../../utils/firebase';
import FilePreview from './FilePreview';

// ----------------------------------------------------------------------

export interface IImageData {
	id: number;
	thumbnail: string | null;
	name: string;
	date: string;
	size: string | number | undefined;
	type?: string;
}

const ITEM_PER_VIEW = 20;

export default function FileListPage() {
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch();
	const { tgMessages, deleteMessages, isTgLoading } = useUserContext();
	const { user } = useSelector((state) => state.user);
	const { themeStretch } = useSettingsContext();
	const table = useTable({ defaultRowsPerPage: 10 });

	const [filesData, setFilesData] = useState<IImageData[]>([]);
	const [loading, setLoading] = useState(true);
	const [openUploadFile, setOpenUploadFile] = useState(false);
	const [pagination, setPagination] = useState(ITEM_PER_VIEW);
	const [openNewFolder, setOpenNewFolder] = useState(false);
	const [folderName, setFolderName] = useState('');
	const [openConfirm, setOpenConfirm] = useState(false);
	const [fileId, setFileId] = useState<number | null>(null);

	const processedMessages = useMemo(() => {
		setFilesData([]);
		setLoading(true);
		return tgMessages
			.filter((message) => message.message.includes(id || ''))
			.sort((a, b) => b.date - a.date);
	}, [tgMessages, id]);

	useEffect(() => {
		fetchUploadedImages();
	}, [processedMessages, pagination]);

	const cachedThumbnails = useRef(new Map<number, string>());

	const handleOpenUploadFile = () => {
		setOpenUploadFile(true);
	};

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
	};

	const handleCloseNewFolder = () => {
		setOpenNewFolder(false);
	};

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	const handleDeleteItems = (selected: string[]) => {
		const { setSelected } = table;
		deleteSavedMessages(selected.map(Number));
		deleteMessages(selected.map(Number));
		setSelected([]);
	};

	const handleFileClick = (id: number) => {
		setFileId(id);
	};

	const processMessage = (msg: Api.Message): IImageData => {
		const sizeInBytes = msg.document?.size
			? typeof msg.document.size === 'number'
				? msg.document.size
				: Number(msg.document.size)
			: 0;

		let size = 'Unknown';

		if (sizeInBytes > 0) {
			size = formatBytes(sizeInBytes);
		}

		return {
			id: msg.id,
			thumbnail: cachedThumbnails.current.get(msg.id) || null,
			name: msg.message || 'Unknown Name',
			date: new Date(msg.date * 1000).toLocaleString(),
			size,
			type: msg.document?.mimeType,
		};
	};

	const downloadImage = async (msg: any, client: any): Promise<void> => {
		try {
			if (!msg) {
				return;
			}
			let file = null;

			if (msg.media instanceof Api.MessageMediaPhoto && msg.media.photo instanceof Api.Photo) {
				const smallestSize = msg.media.photo.sizes[0];
				file = await client.downloadMedia(msg.media, {
					thumb: smallestSize,
				});
			} else if (
				msg.media instanceof Api.MessageMediaDocument &&
				msg.media.document instanceof Api.Document &&
				msg.media.document.mimeType
			) {
				const thumbs = msg.media.document.thumbs;
				if (thumbs && thumbs.length > 0) {
					const smallestThumb = thumbs[1] || thumbs[0];
					file = await client.downloadMedia(msg.media, {
						thumb: smallestThumb,
					});
				}
			}

			if (file) {
				const fileUrl = URL.createObjectURL(new Blob([file], { type: 'image/jpeg' }));
				cachedThumbnails.current.set(msg?.id, fileUrl);
				setFilesData((prevData) =>
					prevData.map((data) => (data.id === msg.id ? { ...data, thumbnail: fileUrl } : data))
				);
			}
		} catch (downloadError) {
			console.error('Error while downloading', downloadError);
		}
	};

	const fetchUploadedImages = async (): Promise<void> => {
		try {
			const client = await getTelegramClient();

			const initialData: IImageData[] = processedMessages
				.slice(0, pagination)
				.filter((msg: any) => msg?.media?.document?.thumbs || msg?.media?.photo)
				.map(processMessage);

			setFilesData(initialData);
			setLoading(false);

			const firstDownload = processedMessages.find(
				(msg) => msg.media && !cachedThumbnails.current.has(msg.id)
			);
			// Wait for first image download complete
			await downloadImage(firstDownload, client);

			const downloadPromises = processedMessages.map(async (msg) => {
				if (msg.media && !cachedThumbnails.current.has(msg.id)) {
					await downloadImage(msg, client);
				}
			});

			await Promise.all(downloadPromises);
		} catch (error) {
			console.error('Error fetching uploaded images:', error);
		}
	};

	function findSubFoldersById(folders?: FolderType[], targetId?: string): FolderType[] | undefined {
		if (!folders || !targetId) {
			return;
		}
		for (const folder of folders) {
			if (folder.id === targetId) {
				return folder.folders;
			}
			const found = findSubFoldersById(folder.folders, targetId);
			if (found) {
				return found;
			}
		}
		return undefined;
	}

	const addSubFolder = (
		folders?: FolderType[],
		targetId?: string,
		newFolder?: FolderType
	): FolderType[] | undefined => {
		if (!folders || !targetId || !newFolder) {
			return;
		}
		return folders.map((folder) => {
			if (folder.id === targetId) {
				return {
					...folder,
					folders: [...(folder.folders || []), newFolder],
				};
			} else if (folder?.folders?.length) {
				return {
					...folder,
					folders: addSubFolder(folder.folders, targetId, newFolder),
				};
			}
			return folder;
		});
	};

	const handleCreateSubFolder = async () => {
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
				folders: addSubFolder(user?.folders, id, newFolder),
			});
			dispatch(updateUser(newUser));
		}
	};

	return (
		<>
			<Helmet>
				<title> Files | Tele Manager</title>
			</Helmet>

			<Container maxWidth={themeStretch ? false : 'lg'}>
				<CustomBreadcrumbs
					heading="Files"
					links={[{ name: 'Home', href: PATH_DASHBOARD.root }, { name: 'Files' }]}
					action={
						<>
							<Button
								variant="soft"
								startIcon={<Iconify icon="eva:cloud-upload-fill" />}
								onClick={handleOpenUploadFile}
							>
								Upload
							</Button>
							<Button
								sx={{ marginLeft: 1 }}
								variant="contained"
								startIcon={<Iconify icon="eva:plus-fill" />}
								onClick={() => setOpenNewFolder(true)}
							>
								New folder
							</Button>
						</>
					}
				/>

				{!!findSubFoldersById(user?.folders, id)?.length && (
					<Box sx={{ marginBottom: 1 }}>
						<FileGridView
							loading={false}
							table={table}
							data={findSubFoldersById(user?.folders, id) || []}
							onDeleteItem={() => {
								//
							}}
						/>
					</Box>
				)}

				<InfiniteScroll
					dataLength={filesData.length}
					next={() => setPagination((prev) => prev + ITEM_PER_VIEW)}
					hasMore={processedMessages.length > filesData.length}
					loader={
						processedMessages.length > filesData.length ? (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '16px',
								}}
							>
								<CircularProgress size={'25px'} />
							</div>
						) : null
					}
					scrollThreshold="100px"
					style={{
						overflowAnchor: 'none',
					}}
				>
					<FileList
						table={table}
						files={filesData}
						loading={loading || isTgLoading}
						onOpenConfirm={handleOpenConfirm}
						onFileClick={handleFileClick}
					/>
				</InfiniteScroll>

				<FileUploadDialog open={openUploadFile} onClose={handleCloseUploadFile} />

				<FileNewFolderDialog
					open={openNewFolder}
					onClose={handleCloseNewFolder}
					title="New Folder"
					onCreate={handleCreateSubFolder}
					folderName={folderName}
					onChangeFolderName={(event) => setFolderName(event.target.value)}
				/>

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
			</Container>
			{!!fileId && <FilePreview onClose={() => setFileId(null)} fileId={fileId} />}
		</>
	);
}
