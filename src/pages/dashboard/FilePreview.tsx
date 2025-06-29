import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Dialog, IconButton, Typography } from '@mui/material';
import { Api } from 'telegram';
import Iconify from '../../components/iconify';
import { useUserContext } from '../../auth/useUserContext';
import { getTelegramClient } from '../../utils/telegram';
import { cachedDownloadedFiles, cachedThumbnails } from '../../utils/cachedFilesStore';
import useResponsive from '../../hooks/useResponsive';
import {
	filePreviewDialogCloseButtonSx,
	filePreviewDialogDownloadButtonSx,
	filePreviewDialogLoadingSx,
	filePreviewDialogMainBox,
	filePreviewDialogSx,
} from './style';

interface Props {
	fileId: number;
	onClose?: VoidFunction;
}

const FilePreview: React.FC<Props> = ({ fileId, onClose }) => {
	const isMobile = useResponsive('down', 'sm');
	const { tgMessages } = useUserContext();
	const [fileData, setFileData] = useState<string | null>(null);
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [imageWidth, setImageWidth] = useState('auto');
	const [imageHeight, setImageHeight] = useState('auto');

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
							setImageHeight(height);
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

	const renderTopSection = useMemo(() => {
		return (
			<React.Fragment>
				<IconButton onClick={onClose} sx={filePreviewDialogCloseButtonSx}>
					<Iconify width={25} icon="mingcute:close-line" />
				</IconButton>
				<IconButton onClick={handleDownload} sx={filePreviewDialogDownloadButtonSx}>
					{!loading && <Iconify width={25} icon="material-symbols:download-rounded" />}
				</IconButton>
			</React.Fragment>
		);
	}, [onClose, handleDownload, loading]);

	const ColoredCircularProgress = () => {
		return (
			<React.Fragment>
				<svg width={0} height={0}>
					<defs>
						<linearGradient id="my_gradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#4285F4">
								<animate
									attributeName="stop-color"
									values="#4285F4;#EA4335;#FBBC05;#34A853;#4285F4"
									dur="2s"
									repeatCount="indefinite"
								/>
							</stop>
							<stop offset="100%" stopColor="#4285F4">
								<animate
									attributeName="stop-color"
									values="#4285F4;#EA4335;#FBBC05;#34A853;#4285F4"
									dur="2s"
									repeatCount="indefinite"
								/>
							</stop>
						</linearGradient>
					</defs>
				</svg>
				<CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
			</React.Fragment>
		);
	};

	return (
		<Dialog onClose={onClose} open sx={filePreviewDialogSx}>
			{renderTopSection}
			<Box sx={filePreviewDialogMainBox}>
				{loading && (
					<Box sx={filePreviewDialogLoadingSx}>
						<Box sx={{ opacity: 1 }}>
							<ColoredCircularProgress />
						</Box>
					</Box>
				)}

				{fileType?.startsWith('image/') && (fileData || thumbnail) && (
					<img
						style={{
							display: 'block',
							margin: 'auto',
							overflowClipMargin: 'content-box',
							objectFit: 'contain',
							height: isMobile ? '100%' : imageHeight,
							width: isMobile ? imageWidth : '100%',
						}}
						src={fileData || thumbnail || ''}
						alt="Image"
					/>
				)}

				{fileType?.startsWith('video/') &&
					(fileData ? (
						<video controls style={{ width: window.innerWidth * 0.7, height: '100%' }}>
							<source src={fileData} type={fileType} />
						</video>
					) : (
						<Typography sx={{ color: 'white' }}>
							Your video is downloading, it will show after download finish!
						</Typography>
					))}
				{!fileType?.startsWith('image/') && !fileType?.startsWith('video/') && (
					<Typography sx={{ color: 'white' }}>Preview not available for this file type.</Typography>
				)}
			</Box>
		</Dialog>
	);
};

export default FilePreview;
