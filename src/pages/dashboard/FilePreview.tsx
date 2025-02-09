import { Box, Dialog, IconButton } from '@mui/material';
import Iconify from '../../components/iconify';
import { useUserContext } from '../../auth/useUserContext';
import { useEffect, useState } from 'react';
import { getTelegramClient } from '../../utils/telegram';
import { Api } from 'telegram';
import Loader from '../../components/loader';

interface Props {
	fileId: number;
	onClose?: VoidFunction;
}

const FilePreview: React.FC<Props> = ({ fileId, onClose }) => {
	const { tgMessages } = useUserContext();
	const [imageData, setImageData] = useState<string | null>(null);
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [originalImageBlob, setOriginalImageBlob] = useState<Blob | null>(null);
	const [imageHeight, setImageHeight] = useState('auto');
	const [imageWidth, setImageWidth] = useState('auto');

	useEffect(() => {
		const fetchImageData = async () => {
			try {
				const client = await getTelegramClient();
				const messages: any = tgMessages.filter((item) => item.id === fileId);
				let width = null;
				let height = null;
				if (messages.length > 0) {
					// Use thumbnail while loading
					if (messages[0].media?.document?.thumbs) {
						const imageAttr = messages[0].media.document.attributes.find(
							(attr: any) => attr instanceof Api.DocumentAttributeImageSize
						);
						if (imageAttr) {
							height = imageAttr.h;
							width = imageAttr.w;
							const maxScreenHeight = window.innerHeight * 0.8;
							const scaleFactor = (maxScreenHeight / height) * 0.8;

							if (height > maxScreenHeight) {
								height = maxScreenHeight;
								width = Math.round(width * scaleFactor);
							}

							setImageWidth(width);
							setImageHeight(height);
						}
						const thumbs = messages[0].media.document.thumbs;
						const smallestThumb = thumbs[1] || thumbs[0];
						const thumbFile = await client.downloadMedia(messages[0].media, {
							thumb: smallestThumb,
						});
						if (thumbFile) {
							const thumbUrl = URL.createObjectURL(new Blob([thumbFile], { type: 'image/jpeg' }));
							setThumbnail(thumbUrl);
						}
					}
					// Fetch the original image
					if (messages[0].media?.document) {
						const document = messages[0].media.document;
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
							chunks.push(chunk);
						}

						const originalBlob = new Blob(chunks, { type: 'image/jpeg' });
						const fileUrl = URL.createObjectURL(originalBlob);
						setImageData(fileUrl);
						setOriginalImageBlob(originalBlob);
					}
				}
			} catch (error) {
				console.error('Error fetching image data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchImageData();
	}, [fileId]);

	const handleDownload = () => {
		if (originalImageBlob) {
			const downloadUrl = URL.createObjectURL(originalImageBlob);
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = `image_${fileId}.jpg`;
			link.click();
			URL.revokeObjectURL(downloadUrl);
		}
	};
	return (
		<Dialog
			onClose={onClose}
			open
			sx={{
				'& .css-12laf6f-MuiBackdrop-root-MuiDialog-backdrop': {
					backgroundColor: '#1f1f1feb',
					opacity: '0.7 !important',
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
					boxShadow: 'none',
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
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					zIndex: 1302,
					'&:hover': {
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
					},
				}}
			>
				<Iconify icon="material-symbols:close-small-rounded" />
			</IconButton>
			{originalImageBlob && (
				<IconButton
					onClick={handleDownload}
					sx={{
						position: 'fixed',
						top: 16,
						right: 64,
						color: '#fff',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						zIndex: 1302,
						'&:hover': {
							backgroundColor: 'rgba(0, 0, 0, 0.7)',
						},
					}}
				>
					<Iconify icon="material-symbols:download-rounded" />
				</IconButton>
			)}
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{loading && <Loader />}
				<Box>
					{(imageData || thumbnail) && (
						<img
							style={{
								display: 'block',
								margin: 'auto',
								overflowClipMargin: 'content-box',
								objectFit: 'contain',
								height: imageHeight,
								width: imageWidth,
							}}
							src={imageData || thumbnail || ''}
							alt="Image"
						/>
					)}
				</Box>
			</Box>
		</Dialog>
	);
};

export default FilePreview;
