/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Api } from 'telegram';
import { getTelegramClient } from '../../utils/telegram';
import Loader from '../../components/loader';
import { Box } from '@mui/material';
import { useUserContext } from '../../auth/useUserContext';

interface Props {
	fileId: number;
}

const ImageView: React.FC<Props> = ({ fileId }) => {
	const { tgMessages } = useUserContext();
	const [imageData, setImageData] = useState<string | null>(null);
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [originalImageBlob, setOriginalImageBlob] = useState<Blob | null>(null);
	const [downloadProgress, setDownloadProgress] = useState<number>(0);
	const [imageHeight, setImageHeight] = useState('auto');
	const [imageWidth, setImageWidth] = useState('auto');

	useEffect(() => {
		const fetchImageData = async () => {
			try {
				const client = await getTelegramClient();
				// const savedMessagesPeer = await client.getInputEntity('me');
				// const messages: any = await client.getMessages(savedMessagesPeer, {
				// 	ids: [fileId],
				// });
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
					setDownloadProgress(1);
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
						let totalBytes = 0;

						for await (const chunk of client.iterDownload({
							file: inputFileLocation,
							requestSize: 2048 * 1024, // 2MB chunks
							chunkSize: 2048 * 1024,
						})) {
							chunks.push(chunk);
							totalBytes += chunk.length;

							const totalSize = document.size || 100 * 1024 * 1024; // Default to 100MB if size is unknown
							const progress = Math.min((totalBytes / totalSize) * 100, 100);
							setDownloadProgress(Math.round(progress));
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

	return (
		<>
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
						alt="Alt image"
					/>
				)}
			</Box>
		</>
	);
};

export default ImageView;
