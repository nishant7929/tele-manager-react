import React, { useEffect, useState } from 'react';
import { Api } from 'telegram';
import { useParams, Link } from 'react-router-dom';
import { getTelegramClient } from '../../utils/telegram';

const ImageView: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [imageData, setImageData] = useState<string | null>(null);
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [originalImageBlob, setOriginalImageBlob] = useState<Blob | null>(null);
	const [downloadProgress, setDownloadProgress] = useState<number>(0);

	useEffect(() => {
		const fetchImageData = async() => {
			try {
				const client = await getTelegramClient();
				const savedMessagesPeer = await client.getInputEntity('me');
				const messages: any = await client.getMessages(
					savedMessagesPeer,
					{
						ids: [Number(id)],
					}
				);

				if (messages.length > 0) {
					// Use thumbnail while loading
					if (messages[0].media?.document?.thumbs) {
						const thumbs = messages[0].media.document.thumbs;
						const smallestThumb = thumbs[1] || thumbs[0];
						const thumbFile = await client.downloadMedia(
							messages[0].media,
							{
								thumb: smallestThumb,
							}
						);
						if (thumbFile) {
							const thumbUrl = URL.createObjectURL(
								new Blob([thumbFile], { type: 'image/jpeg' })
							);
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
							chunkSize: 2048 * 1024
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
	}, [id]);

	const handleDownload = () => {
		if (originalImageBlob) {
			const downloadUrl = URL.createObjectURL(originalImageBlob);
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = `image_${id}.jpg`; // Adjust the file name and extension as needed
			link.click();
			URL.revokeObjectURL(downloadUrl); // Cleanup the URL object
		}
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Link to="/">Back to gallery</Link>
			<div style={{ flex: 1, position: 'relative' }}>


				{loading && <div>Loading...</div>}
				{(downloadProgress > 0 && downloadProgress !== 100) && <span>({downloadProgress}%)</span>}
				{(imageData || thumbnail) && (
					<img
						style={{
							width: '100%',
							height: 'auto',
							maxHeight: '100%',
							position: 'absolute',
							margin: 'auto',
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
							imageOrientation: 'from-image',
							objectFit: 'contain',
						}}
						src={imageData || thumbnail || ''}
						alt="Centered"
					/>
				)}
			</div>
			{originalImageBlob && (
				<div style={{ textAlign: 'center', margin: '20px 0' }}>
					<button
						onClick={handleDownload}
						style={{
							padding: '10px 20px',
							fontSize: '16px',
							cursor: 'pointer',
							backgroundColor: '#4caf50',
							color: 'white',
							border: 'none',
							borderRadius: '5px',
						}}
					>
						Download Original Image
					</button>
				</div>
			)}
		</div>
	);
};

export default ImageView;
