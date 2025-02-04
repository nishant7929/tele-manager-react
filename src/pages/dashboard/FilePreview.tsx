import { Box, Dialog } from '@mui/material';
import ImageView from './ImageView';

interface Props {
	fileId: number;
	onClose?: VoidFunction;
}

const FilePreview: React.FC<Props> = ({ fileId, onClose }) => {
	return (
		<Dialog
			onClose={onClose}
			open
			sx={{
				'& .MuiPaper-rounded': { overflow: 'hidden', backgroundColor: 'unset', borderRadius: '0 !important', boxShadow: 'none' },
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<ImageView fileId={fileId} />
			</Box>
		</Dialog>
	);
};

export default FilePreview;
