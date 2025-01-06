import imageCompression from 'browser-image-compression';
import React, { BaseSyntheticEvent } from 'react';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

export const API_ID = process.env.REACT_APP_API_ID || 0;
export const API_HASH = process.env.REACT_APP_API_HASH || '';

const savedSession = localStorage.getItem('telegram_session') || '';
const SESSION = new StringSession(savedSession);

export const telegramClient = {
	connect: async(): Promise<TelegramClient> => {
		const client = new TelegramClient(
			SESSION,
			Number(API_ID),
			API_HASH as string,
			{
				connectionRetries: 5,
				useWSS: true,
			}
		);
		await client.connect();
		return client;
	},
};

export const sendCodeHandler = async(phoneNumber: string): Promise<void> => {
	try {
		const client = await telegramClient.connect();
		await client.sendCode(
			{
				apiId: Number(API_ID),
				apiHash: API_HASH,
			},
			phoneNumber
		);
		alert('OTP sent to your phone!');
	} catch (error) {
		console.error('Error sending code:', error);
	}
};

export const verifyOtp = async(
	phoneNumber: string,
	phoneCode: string
): Promise<boolean>  => {
	try {
		const client = await telegramClient.connect();
		await client.start({
			phoneNumber: async() => phoneNumber,
			phoneCode: async() => phoneCode,
			onError: (err) => console.error('Login error:', err),
		});
		const session = client.session.save() as any;
		localStorage.setItem('telegram_session', session);
		return true;
	} catch (error) {
		console.error('Error during login:', error);
		return false;
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

		const client = await telegramClient.connect();

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
										img.id === fileData.id
											? { ...img, progress: percentage }
											: img
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
							thumb: thumbFile
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
						console.error(
							`Error uploading file ${file.name}:`,
							uploadError
						);
						setUploadingImages((prev) =>
							prev.map((img) =>
								img.id === fileData.id
									? { ...img, progress: -1, status: 'failed' }
									: img
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

export const compressImage = async(file: File, maxSizeMB: number): Promise<Blob> => {
	const options = {
		maxSizeMB,
		maxWidthOrHeight: 800,
		useWebWorker: true,
	};
	return await imageCompression(file, options);
};
