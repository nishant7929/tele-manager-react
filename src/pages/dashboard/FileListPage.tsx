import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Api } from 'telegram';
import InfiniteScroll from 'react-infinite-scroll-component';
// @mui
import { Container, Button, CircularProgress } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';
// sections
import { FileList } from '../../sections/@dashboard/file-manager';
import FileUploadDialog from '../../sections/@dashboard/file/portal/FileUploadDialog';
import { useUserContext } from '../../auth/useUserContext';
import { getTelegramClient } from '../../utils/telegram';
import { formatBytes } from '../../utils/formatNumber';

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
	const { tgMessages } = useUserContext();
	const { themeStretch } = useSettingsContext();

	const [filesData, setFilesData] = useState<IImageData[]>([]);
	const [loading, setLoading] = useState(true);
	const [openUploadFile, setOpenUploadFile] = useState(false);
	const [pagination, setPagination] = useState(ITEM_PER_VIEW);

	const processedMessages = useMemo(() => {
		return tgMessages
			.filter((message) => message.message.includes(id || ''))
			.sort((a, b) => b.date - a.date);
	}, [tgMessages, id]);

	const cachedThumbnails = useRef(new Map<number, string>());

	const handleOpenUploadFile = () => {
		setOpenUploadFile(true);
	};

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
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

	const downloadImage = async(msg: any, client: any): Promise<void> => {
		try {
			if (!msg) return;
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

	const fetchUploadedImages = async(): Promise<void> => {
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

			const downloadPromises = processedMessages.map(async(msg) => {
				if (msg.media && !cachedThumbnails.current.has(msg.id)) {
					await downloadImage(msg, client);
				}
			});

			await Promise.all(downloadPromises);
		} catch (error) {
			console.error('Error fetching uploaded images:', error);
		}
	};

	useEffect(() => {
		fetchUploadedImages();
	}, [processedMessages, pagination]);

	return (
		<>
			<Helmet>
				<title> Files | Tele Cloud</title>
			</Helmet>

			<Container maxWidth={themeStretch ? false : 'lg'}>
				<CustomBreadcrumbs
					heading="Files"
					links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Files' }]}
					action={
						<Button
							variant="contained"
							startIcon={<Iconify icon="eva:cloud-upload-fill" />}
							onClick={handleOpenUploadFile}
						>
							Upload
						</Button>
					}
				/>

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
					scrollThreshold='100px'
					style={{
						overflowAnchor: 'none',
					}}
				>
					<FileList files={filesData} loading={loading} />
				</InfiniteScroll>

				<FileUploadDialog open={openUploadFile} onClose={handleCloseUploadFile} />
			</Container>
		</>
	);
}
