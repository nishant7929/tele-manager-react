import { DropzoneOptions } from 'react-dropzone';
// @mui
import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { UploadFileType } from '../../utils/telegram';

// ----------------------------------------------------------------------

export interface CustomFile extends File {
	path?: string;
	preview?: string;
	lastModifiedDate?: Date;
}

export interface UploadProps extends DropzoneOptions {
	error?: boolean;
	sx?: SxProps<Theme>;
	thumbnail?: boolean;
	placeholder?: React.ReactNode;
	helperText?: React.ReactNode;
	disableMultiple?: boolean;
	//
	file?: CustomFile | string | null;
	onDelete?: VoidFunction;
	//
	files?: UploadFileType[];
	onUpload?: VoidFunction;
	onRemove?: (__file: CustomFile | string) => void;
	onRemoveAll?: VoidFunction;
}
