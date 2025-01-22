import imageCompression from 'browser-image-compression';
import React, { BaseSyntheticEvent } from 'react';
import { Api, Logger, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { LogLevel } from 'telegram/extensions/Logger';
import { FOLDER_POSTFIX, FOLDER_PREFIX } from './constant';

export const API_ID = import.meta.env.VITE_API_ID || 0;
export const API_HASH = import.meta.env.VITE_API_HASH || '';

const savedSession = localStorage.getItem('telegram_session') || '';
const SESSION = new StringSession(savedSession);

export interface SendCodeResult {
	success: boolean;
	message: string;
}

let globalTelegramClient: TelegramClient | null = null;

export const getTelegramClient = async(): Promise<TelegramClient> => {
	if (!globalTelegramClient) {
		globalTelegramClient = new TelegramClient(SESSION, Number(API_ID), API_HASH as string, {
			connectionRetries: 5,
			useWSS: true,
			baseLogger: new Logger(LogLevel.NONE),
		});
		await globalTelegramClient.connect();
	}
	return globalTelegramClient;
};

export const telegramClient = {
	logout: async(): Promise<void> => {
		const client = await getTelegramClient();
		localStorage.removeItem('telegram_session');
		await client.invoke(new Api.auth.LogOut());
	},
};

export const sendCodeHandler = async(phoneNumber: string): Promise<SendCodeResult> => {
	try {
		const client = await getTelegramClient();

		await client.sendCode(
			{
				apiId: Number(API_ID),
				apiHash: API_HASH,
			},
			phoneNumber
		);
		return { success: true, message: 'OTP sent successfully.' };
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.message.includes('PHONE_NUMBER_INVALID')) {
				return { success: false, message: 'Invalid phone number. Please check and try again.' };
			}
			if (error.message.includes('PHONE_CODE_HASH_EMPTY')) {
				return { success: false, message: 'Unable to send OTP. Please try again later.' };
			}
			return { success: false, message: `Error: ${error.message}` };
		}
		return { success: false, message: 'An unknown error occurred while sending the OTP.' };
	}
};

export const verifyOtp = async(
	phoneNumber: string,
	phoneCode: string
): Promise<{
	success: boolean;
	message: string;
	userInfo?: { tgId: string; phoneNumber: string; displayName: string; lastName?: string };
}> => {
	try {
		const client = await getTelegramClient();

		await client.start({
			phoneNumber: async() => phoneNumber,
			phoneCode: async() => phoneCode,
			onError: (err) => {
				throw new Error(err.message);
			},
		});

		const session = client.session.save() as any;
		localStorage.setItem('telegram_session', session);

		const me = await client.getMe();
		return {
			success: true,
			message: 'Login successful.',
			userInfo: {
				tgId: me.id.toString(),
				phoneNumber: me.phone ?? phoneNumber,
				displayName: `${me.firstName || ''} ${me.lastName || ''}`.trim(),
				lastName: me.lastName ?? undefined,
			},
		};
	} catch (error: unknown) {
		console.error('Error in verifyOtp:', error);

		if (error instanceof Error) {
			if (error.message.includes('PHONE_CODE_INVALID')) {
				return { success: false, message: 'The OTP entered is invalid. Please try again.' };
			}

			if (error.message.includes('PHONE_CODE_EXPIRED')) {
				return { success: false, message: 'The OTP has expired. Please request a new one.' };
			}

			if (error.message.includes('SESSION_PASSWORD_NEEDED')) {
				return {
					success: false,
					message: 'Two-step verification is enabled. Please provide your password.',
				};
			}

			return { success: false, message: error.message };
		}

		return { success: false, message: 'An unknown error occurred during login. Please try again.' };
	}
};

export const uploadFileHandler = async(
	event: BaseSyntheticEvent,
	setUploadingImages: React.Dispatch<React.SetStateAction<any[]>>
): Promise<void> => {
	try {
		const files = event.target.files as FileList;
		if (!files || files.length === 0) {
			alert('No files selected');
			return;
		}

		const client = await getTelegramClient();

		const uploadingFiles = Array.from(files).map((file) => ({
			id: Math.random(),
			name: file.name,
			size: `${(file.size / 1024).toFixed(2)} KB`,
			thumbnail: URL.createObjectURL(file),
			progress: 0,
			status: 'uploading',
		}));

		setUploadingImages((prev) => [...prev, ...uploadingFiles]);

		await Promise.all(
			uploadingFiles.map(async(fileData, index) => {
				const file = files[index] as File;

				const reader = new FileReader();
				reader.onload = async() => {
					try {
						const uploadedFile = await client.uploadFile({
							file,
							workers: 15,
							onProgress: (uploadedBytes: number) => {
								const percentage = Math.floor(uploadedBytes * 100);
								setUploadingImages((prev) =>
									prev.map((img) =>
										img.id === fileData.id ? { ...img, progress: percentage } : img
									)
								);
							},
						});

						const compressedThumbnail = await compressImage(file, 0.05);
						const thumbFile = new File([compressedThumbnail], 'thumb.jpg', { type: 'image/jpeg' });

						await client.sendFile('me', {
							file: uploadedFile,
							caption: file.name,
							forceDocument: true,
							attributes: [
								new Api.DocumentAttributeFilename({
									fileName: file.name,
								}),
							],
							thumb: thumbFile,
						});

						setUploadingImages((prev) =>
							prev.map((img) =>
								img.id === fileData.id
									? {
										...img,
										progress: 100,
										status: 'success',
									  }
									: img
							)
						);
					} catch (uploadError) {
						console.error(`Error uploading file ${file.name}:`, uploadError);
						setUploadingImages((prev) =>
							prev.map((img) =>
								img.id === fileData.id ? { ...img, progress: -1, status: 'failed' } : img
							)
						);
					}
				};

				reader.readAsArrayBuffer(file);
			})
		);
	} catch (error) {
		console.error('Error uploading files:', error);
		alert('Error uploading files.');
	}
};

export interface UploadFileType {
	file: File;
	progress: number;
	id: number;
	preview: string | null;
}

export const uploadFileHandlerV2 = async(
	folderId: string,
	files: File[],
	setUploadingFiles: React.Dispatch<React.SetStateAction<UploadFileType[]>>,
	addMessage: (__message: Api.Message) => void
): Promise<void> => {
	try {
		if (!files || files.length === 0) {
			return;
		}

		const client = await getTelegramClient();

		const createUploadFile = (file: File): UploadFileType => ({
			file,
			progress: 0,
			id: Math.random(),
			preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
		});

		const uploadingFiles: UploadFileType[] = files.map(createUploadFile);

		setUploadingFiles((prev) => [...prev, ...uploadingFiles]);

		const uploadFilesWithLimit = async() => {
			const maxConcurrentUploads = 7;
			const queue: Array<() => Promise<void>> = [];
			let activeUploads = 0;

			const processUpload = async(fileData: UploadFileType, index: number) => {
				const file = files[index] as File;

				const reader = new FileReader();
				reader.onload = async() => {
					try {
						activeUploads++;
						const uploadedFile = await client.uploadFile({
							file,
							workers: 15,
							onProgress: (uploadedBytes: number) => {
								const percentage = Math.floor(uploadedBytes * 100);
								if (percentage < 100) {
									setUploadingFiles((prev) =>
										prev.map((img) =>
											img.id === fileData.id ? { ...img, progress: percentage } : img
										)
									);
								}
							},
						});

						let thumbFile: File | undefined = undefined;
						if (file.type.startsWith('image/')) {
							const compressedThumbnail = await compressImage(file, 0.05);
							thumbFile = new File([compressedThumbnail], 'thumb.jpg', { type: 'image/jpeg' });
						} else if (file.type.startsWith('video/')) {
							const videoThumbnail = await generateVideoThumbnail(file);
							thumbFile = new File([videoThumbnail], 'thumb.jpg', { type: 'image/jpeg' });
						}

						const message = await client.sendFile('me', {
							file: uploadedFile,
							caption: `${FOLDER_PREFIX}${folderId}${FOLDER_POSTFIX}`,
							forceDocument: true,
							attributes: [
								new Api.DocumentAttributeFilename({
									fileName: file.name,
								}),
							],
							thumb: thumbFile,
						});
						addMessage(message);
						setUploadingFiles((prev) => prev.filter((img) => img.id !== fileData.id));
					} catch (uploadError) {
						console.error(`Error uploading file ${file.name}:`, uploadError);
						setUploadingFiles((prev) =>
							prev.map((img) => (img.id === fileData.id ? { ...img, progress: -1 } : img))
						);
					} finally {
						activeUploads--;
						processNext();
					}
				};

				reader.readAsArrayBuffer(file);
			};

			const processNext = () => {
				if (queue.length > 0 && activeUploads < maxConcurrentUploads) {
					const nextUpload = queue.shift();
					if (nextUpload) {
						nextUpload();
					}
				}
			};

			uploadingFiles.forEach((fileData, index) => {
				const uploadTask = async() => {
					await processUpload(fileData, index);
				};
				queue.push(uploadTask);
			});

			for (let i = 0; i < Math.min(maxConcurrentUploads, queue.length); i++) {
				processNext();
			}
		};

		await uploadFilesWithLimit();
	} catch (error) {
		console.error('Error uploading files:', error);
	}
};

const generateVideoThumbnail = async(videoFile: File): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const videoElement = document.createElement('video');
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		videoElement.src = URL.createObjectURL(videoFile);
		videoElement.addEventListener('loadedmetadata', () => {
			// Set canvas dimensions to match video dimensions
			canvas.width = videoElement.videoWidth;
			canvas.height = videoElement.videoHeight;

			// Seek to a specific time (e.g., 1 second) to capture a frame
			videoElement.currentTime = 1;
		});

		videoElement.addEventListener('seeked', () => {
			if (context) {
				// Draw the video frame onto the canvas
				context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
				// Convert the canvas image to a Blob (JPEG format)
				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error('Failed to generate video thumbnail.'));
						}
					},
					'image/jpeg',
					0.9
				); // Adjust quality as needed
			}
		});

		videoElement.addEventListener('error', (err) => {
			reject(err);
		});
	});
};

export const compressImage = async(file: File, maxSizeMB: number): Promise<Blob> => {
	const options = {
		maxSizeMB,
		maxWidthOrHeight: 800,
		useWebWorker: true,
	};
	return await imageCompression(file, options);
};
