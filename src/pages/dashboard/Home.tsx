import React, { type BaseSyntheticEvent, useEffect, useState } from 'react';
import { Api } from 'telegram';
import { Link } from 'react-router-dom';
import { sendCodeHandler, telegramClient, uploadFileHandler, verifyOtp } from '../../utils/telegram';

interface IInitialState {
	phoneNumber: string;
	phoneCode: string;
}

const savedSession = localStorage.getItem('telegram_session') || '';
const initialState: IInitialState = { phoneNumber: '', phoneCode: '' };

interface IImageData {
	id: number;
	thumbnail: string | null;
	name: string;
	date: string;
	size: string | number | undefined;
}

function Home(): React.JSX.Element {
	const [{ phoneNumber, phoneCode }, setAuthInfo] =
		useState<IInitialState>(initialState);
	const [loggedIn, setLoggedIn] = useState<boolean>(!!savedSession);
	const [loginStep, setLoginStep] = useState<
		'LOGIN' | 'OTP' | ''
	>('LOGIN');
	const [imagesData, setImagesData] = useState<IImageData[]>([]);
	const [offsetId, setOffsetId] = useState<number>(0);
	const [uploadingImages, setUploadingImages] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (savedSession) {
			(async() => {
				try {
					await telegramClient.connect();
					setLoggedIn(true);
					setLoading(false);
				} catch (error) {
					setLoading(false);
					setLoginStep('LOGIN');
					console.error('Error auto-connecting:', error);
				}
			})();
		}
	}, []);

	useEffect(() => {
		if (loggedIn) {
			fetchUploadedImages();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loggedIn]);

	const handleLogout = async(): Promise<void> => {
		try {
			const client = await telegramClient.connect();

			await client.invoke(new Api.auth.LogOut());
			localStorage.removeItem('telegram_session');
			setLoggedIn(false);
			setLoginStep('LOGIN');
			setImagesData([]);
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	function inputChangeHandler({
		target: { name, value },
	}: BaseSyntheticEvent): void {
		setAuthInfo((authInfo) => ({ ...authInfo, [name]: value }));
	}

	const fetchUploadedImages = async(): Promise<void> => {
		try {
			const client = await telegramClient.connect();
			const savedMessagesPeer = await client.getInputEntity('me');
			const messages = await client.getMessages(savedMessagesPeer, {
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
								? `${(sizeInBytes / (1024 * 1024)).toFixed(
									2
								  )} MB`
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
							const fileUrl = URL.createObjectURL(
								new Blob([file], { type: 'image/jpeg' })
							);
							setImagesData((prevData) =>
								prevData.map((data) =>
									data.id === msg.id
										? { ...data, thumbnail: fileUrl }
										: data
								)
							);
						}
					} catch (downloadError) {
						console.error(
							`Error downloading media for message ID ${msg.id}:`,
							downloadError
						);
					}
				}
			});

			// Start all downloads concurrently
			await Promise.all(downloadPromises);
		} catch (error) {
			console.error('Error fetching uploaded images:', error);
		}
	};

	const renderLogin = () => {
		return (
			<>
				<h2>Telegram Login</h2>
				<input
					type="text"
					name="phoneNumber"
					value={phoneNumber}
					onChange={inputChangeHandler}
					placeholder="Enter your phone number"
					style={{
						backgroundColor: '#fff',
						color: 'black',
						height: '30px',
						borderRadius: '6px',
					}}
				/>
				<button
					style={{ marginLeft: '25px' }}
					onClick={() => {
						sendCodeHandler(phoneNumber);
						setLoginStep('OTP');
					}}
				>
					Send OTP
				</button>
			</>
		);
	};

	const renderOtp = () => {
		return (
			<>
				<input
					type="text"
					name="phoneCode"
					value={phoneCode}
					onChange={inputChangeHandler}
					placeholder="Enter the OTP"
					style={{
						backgroundColor: '#fff',
						color: 'black',
						height: '30px',
						borderRadius: '6px',
					}}
				/>
				<button
					style={{ marginLeft: '25px' }}
					onClick={async() => {
						const isVerified = await verifyOtp(
							phoneNumber,
							phoneCode
						);
						setLoggedIn(isVerified);
						fetchUploadedImages();
					}}
				>
					Login
				</button>
			</>
		);
	};

	if (loggedIn && loading){
		return <div>Loading....</div>;
	}

	return (
		<div>
			{!loggedIn && loginStep === 'LOGIN' && renderLogin()}
			{!loggedIn && loginStep === 'OTP' && renderOtp()}

			{loggedIn && (
				<>
					<h3>Welcome! You are logged in.

						<button onClick={handleLogout} style={{ marginLeft: '15px', cursor: 'pointer' }}>
							Logout
						</button>
					</h3>

					<input
						type="file"
						accept="image/*"
						multiple
						onChange={(e) =>
							uploadFileHandler(e, setUploadingImages)
						}
					/>
					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							width: '100%',
							gap: '10px',
							marginTop: '20px',
						}}
					>
						{uploadingImages.length > 0 && (
							<h4>Uploading Images:</h4>
						)}
						{uploadingImages.map((data, index) => (
							<div key={index}>
								<img
									src={data.thumbnail}
									alt={data.name}
									style={{
										width: '175px',
										height: '175px',
										objectFit: 'cover',
									}}
									loading="lazy"
								/>
								<div
									style={{
										width: '175px',
										textAlign: 'center',
										marginTop: '5px',
									}}
								>
									{data.status === 'uploading' ? (
										<span>{data.progress}%</span>
									) : data.status === 'success' ? (
										<span style={{ color: 'green' }}>
											Uploaded
										</span>
									) : (
										<span style={{ color: 'red' }}>
											Failed
										</span>
									)}
								</div>
							</div>
						))}
					</div>

					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							width: '100%',
							gap: '10px',
							marginTop: '20px',
						}}
					>
						{imagesData.map((data, index) => (
							<div key={index}>
								{data.thumbnail ? (
									<Link
										to={`/image/${data.id}`}
										key={data.id}
										style={{ textDecoration: 'none' }}
									>
										<img
											src={data.thumbnail}
											alt={data.name}
											style={{
												width: '175px',
												height: '175px',
												objectFit: 'cover',
											}}
											loading="lazy"
										/>
									</Link>
								) : (
									<div
										style={{
											width: '175px',
											height: '175px',
											backgroundColor: '#fff',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '14px',
											color: '#555',
										}}
									>
										Loading...
									</div>
								)}
							</div>
						))}
						{imagesData.length > 0 && (
							<p
								style={{ cursor: 'pointer' }}
								onClick={fetchUploadedImages}
							>
								Load more...
							</p>
						)}
					</div>
				</>
			)}
		</div>
	);
}

export default Home;
