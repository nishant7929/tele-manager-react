import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Api } from 'telegram';
// @mui
import { Container, Button } from '@mui/material';
// redux
import { useDispatch } from '../../redux/store';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
// sections
import { FileList } from '../../sections/@dashboard/e-commerce/shop';
import { telegramClient } from '../../utils/telegram';
import Iconify from '../../components/iconify';
import FileUploadDialog from '../../sections/@dashboard/file/portal/FileUploadDialog';

// ----------------------------------------------------------------------

export interface IImageData {
	id: number;
	thumbnail: string | null;
	name: string;
	date: string;
	size: string | number | undefined;
}

export default function FileListPage() {
	const { id } = useParams<{ id: string }>();
	const { themeStretch } = useSettingsContext();

	const dispatch = useDispatch();

	const [imagesData, setImagesData] = useState<IImageData[]>([]);
	const [offsetId, setOffsetId] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [openUploadFile, setOpenUploadFile] = useState(false);

	const handleOpenUploadFile = () => {
		setOpenUploadFile(true);
	};

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
	};

	const fetchUploadedImages = async(): Promise<void> => {
		// setLoading(true);
		try {
			const client = await telegramClient.connect();
			const savedMessagesPeer = await client.getInputEntity('me');
			const messages = await client.getMessages(savedMessagesPeer, {
				search: id,
				limit: 50,
				offsetId,
			});
			const initialData: IImageData[] = messages
				.filter((msg: any) => msg?.media?.document?.thumbs || msg?.media?.photo)
				.map((msg) => {
					const sizeInBytes = msg.document?.size
						? typeof msg.document.size === 'number'
							? msg.document.size
							: Number(msg.document.size)
						: 0;

					let size = 'Unknown';

					if (sizeInBytes > 0) {
						size =
							sizeInBytes >= 1024 * 1024
								? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
								: `${(sizeInBytes / 1024).toFixed(2)} KB`;
					}

					return {
						id: msg.id,
						thumbnail: null,
						name: msg.message || 'Unknown Name',
						date: new Date(msg.date * 1000).toLocaleString(),
						size,
					};
				});
			setImagesData([...imagesData, ...initialData]);
			setLoading(false);
			setOffsetId(messages[messages.length - 1].id);
			const downloadPromises = messages.map(async(msg) => {
				if (msg.media) {
					try {
						let file = null;

						if (
							msg.media instanceof Api.MessageMediaPhoto &&
							msg.media.photo instanceof Api.Photo
						) {
							const smallestSize = msg.media.photo.sizes[0];
							file = await client.downloadMedia(msg.media, {
								thumb: smallestSize,
							});
						} else if (
							msg.media instanceof Api.MessageMediaDocument &&
							msg.media.document instanceof Api.Document &&
							msg.media.document.mimeType &&
							msg.media.document.mimeType.startsWith('image/')
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
							setImagesData((prevData) =>
								prevData.map((data) =>
									data.id === msg.id ? { ...data, thumbnail: fileUrl } : data
								)
							);
						}
					} catch (downloadError) {
						console.error(`Error downloading media for message ID ${msg.id}:`, downloadError);
					}
				}
			});

			// Start all downloads concurrently
			await Promise.all(downloadPromises);
		} catch (error) {
			console.error('Error fetching uploaded images:', error);
		}
	};

	useEffect(() => {
		fetchUploadedImages();
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title> Files | Zcloud</title>
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

				<FileList files={imagesData} loading={loading} />

				<FileUploadDialog open={openUploadFile} onClose={handleCloseUploadFile} />

			</Container>
		</>
	);
}
