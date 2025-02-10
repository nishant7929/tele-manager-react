import { Box, CircularProgress, Dialog, IconButton, Typography } from '@mui/material';
import Iconify from '../../components/iconify';
import { useUserContext } from '../../auth/useUserContext';
import { useEffect, useState } from 'react';
import { getTelegramClient } from '../../utils/telegram';
import { Api } from 'telegram';
import Loader from '../../components/loader';
import { cachedDownloadedFiles, cachedThumbnails } from '../../utils/cachedFilesStore';

interface Props {
	fileId: number;
	onClose?: VoidFunction;
}

const FilePreview: React.FC<Props> = ({ fileId, onClose }) => {
	const { tgMessages } = useUserContext();
	const [fileData, setFileData] = useState<string | null>(null);
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [imageWidth, setImageWidth] = useState('auto');

	const [fileType, setFileType] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);

	useEffect(() => {
		const abortController = new AbortController();
		const fetchImageData = async () => {
			try {
				const client = await getTelegramClient();
				const messages: any = tgMessages.filter((item) => item.id === fileId);
				const message = messages[0];
				let width = null;
				let height = null;

				const document = message.media.document;
				const mimeType = document.mimeType || '';
				const fileNameAttr = document.attributes.find(
					(attr: any) => attr instanceof Api.DocumentAttributeFilename
				);
				const fileName = fileNameAttr ? fileNameAttr.fileName : `file_${fileId}`;
				setFileType(mimeType);
				setFileName(fileName);

				if (messages.length > 0) {
					// Use thumbnail while loading
					if (message.media?.document?.thumbs) {
						const imageAttr = message.media.document.attributes.find(
							(attr: any) => attr instanceof Api.DocumentAttributeImageSize
						);
						if (imageAttr) {
							height = imageAttr.h;
							width = imageAttr.w;
							const maxScreenHeight = window.innerHeight * 0.9;
							const scaleFactor = (maxScreenHeight / height) * 0.9;

							if (height > maxScreenHeight) {
								height = maxScreenHeight;
								width = Math.round(width * scaleFactor);
							}

							setImageWidth(width);
						}
						if (cachedDownloadedFiles.has(message.id)) {
							setFileData(cachedDownloadedFiles.get(message.id) || '');
							return;
						}
						if (cachedThumbnails.has(message.id)) {
							setThumbnail(cachedThumbnails.get(message.id) || '');
						} else {
							const thumbs = message.media.document.thumbs;
							const smallestThumb = thumbs[1] || thumbs[0];
							const thumbFile = await client.downloadMedia(message.media, {
								thumb: smallestThumb,
							});
							if (thumbFile) {
								const thumbUrl = URL.createObjectURL(new Blob([thumbFile], { type: 'image/jpeg' }));
								setThumbnail(thumbUrl);
							}
						}
					}
					// Fetch the original image
					if (message.media?.document) {
						const document = message.media.document;
						const inputFileLocation = new Api.InputDocumentFileLocation({
							id: document.id,
							accessHash: document.accessHash,
							fileReference: document.fileReference,
							thumbSize: '', // Empty string for full file
						});

						// Download using iterDownload
						const chunks = [];

						for await (const chunk of client.iterDownload({
							file: inputFileLocation,
							requestSize: 2048 * 1024, // 2MB chunks
							chunkSize: 2048 * 1024,
						})) {
							if (abortController.signal.aborted) {
								return;
							}
							chunks.push(chunk);
						}

						const originalBlob = new Blob(chunks, { type: 'image/jpeg' });
						const fileUrl = URL.createObjectURL(originalBlob);
						cachedDownloadedFiles.set(message?.id, fileUrl);
						setFileData(fileUrl);
					}
				}
			} catch (error) {
				console.error('Error fetching image data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchImageData();
		return () => {
			abortController.abort(); // **Abort ongoing download if modal closes**
		};
	}, [fileId]);

	const handleDownload = () => {
		if (fileData) {
			const link = document.createElement('a');
			link.href = fileData;
			link.download = fileName || `file_${fileId}`;
			link.click();
			// URL.revokeObjectURL(fileData);
		}
	};

	return (
		<Dialog
			onClose={onClose}
			open
			sx={{
				'& .css-12laf6f-MuiBackdrop-root-MuiDialog-backdrop': {
					backgroundColor: '#1f1f1feb',
					opacity: '1 !important',
				},
				'& .MuiDialog-container': {
					// backgroundColor: '#262626',
					// backgroundColor: '#1f1f1feb',
					position: 'relative',
				},
				'& .MuiPaper-rounded': {
					overflow: 'hidden',
					backgroundColor: 'unset',
					borderRadius: '0 !important',
					boxShadow: '0px 4px 15px 2px rgba(0,0,0,0.35)',
					maxWidth: 'unset',
				},
			}}
		>
			<IconButton
				onClick={onClose}
				sx={{
					position: 'fixed',
					top: 16,
					right: 16,
					color: '#fff',
					// backgroundColor: 'rgba(0, 0, 0, 0.5)',
					zIndex: 1302,
					'&:hover': {
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
					},
				}}
			>
				<Iconify width={25} icon="mingcute:close-line" />
			</IconButton>
			<IconButton
				onClick={handleDownload}
				sx={{
					position: 'fixed',
					top: 16,
					right: 64,
					color: '#fff',
					// backgroundColor: 'rgba(0, 0, 0, 0.5)',
					zIndex: 1302,
					'&:hover': {
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
					},
				}}
			>
				{loading ? (
					<Box sx={{ width: 25, height: 25 }}>
						<CircularProgress size={25} />
					</Box>
				) : (
					<Iconify width={25} icon="material-symbols:download-rounded" />
				)}
			</IconButton>
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{loading && <Loader />}
				<Box>
					{fileType?.startsWith('image/') && (fileData || thumbnail) && (
						<img
							style={{
								display: 'block',
								margin: 'auto',
								overflowClipMargin: 'content-box',
								objectFit: 'contain',
								// height: imageHeight,
								width: imageWidth,
							}}
							src={fileData || thumbnail || ''}
							alt="Image"
						/>
					)}

					{fileType?.startsWith('video/') &&
						(fileData ? (
							<video controls style={{ width: '100%' }}>
								<source src={fileData} type={fileType} />
							</video>
						) : (
							<Typography sx={{ color: 'white' }}>
								Your video is downloading, it will show after full download complete!
							</Typography>
						))}
					{!fileType?.startsWith('image/') && !fileType?.startsWith('video/') && (
						<Typography sx={{ color: 'white' }}>
							Preview not available for this file type.
						</Typography>
					)}
				</Box>
			</Box>
		</Dialog>
	);
};

export default FilePreview;
