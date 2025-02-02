import { useState, useCallback } from 'react';
// @mui
import {
	Dialog,
	DialogProps,
	DialogTitle,
	DialogContent,
} from '@mui/material';
import { Upload } from '../../../../components/upload';
import { uploadFileHandlerV2, UploadFileType } from '../../../../utils/telegram';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../../../auth/useUserContext';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
	title?: string;
	//
	open: boolean;
	onClose: VoidFunction;
}

export default function FileUploadDialog({
	title = 'Upload Files',
	open,
	onClose,
	...other
}: Props) {
	const { id } = useParams<{ id: string }>();
	const { addMessage } = useUserContext();
	const [files, setFiles] = useState<UploadFileType[]>([]);

	const handleDrop = useCallback(
		(acceptedFiles: File[]) => {
			uploadFileHandlerV2(id || '', acceptedFiles, setFiles, addMessage);
		},
		[files, id]
	);

	const handleRemoveFile = (inputFile: File | string) => {
		const filtered = files.filter((file) => file.file !== inputFile);
		setFiles(filtered);
	};

	return (
		<Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
			<DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

			<DialogContent dividers sx={{ border: 'none' }}>
				<Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
			</DialogContent>
		</Dialog>
	);
}
