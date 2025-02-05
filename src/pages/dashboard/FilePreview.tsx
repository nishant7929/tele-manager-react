import { Box, Dialog, IconButton } from '@mui/material';
import ImageView from './ImageView';
import Iconify from '../../components/iconify';

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
				'& .css-12laf6f-MuiBackdrop-root-MuiDialog-backdrop':{
					backgroundColor: '#1f1f1feb',
					opacity: '0.7 !important'
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
					left: 16,
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
			<IconButton
				// onClick={onClose}
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
				<Iconify icon="material-symbols:download-rounded" />
			</IconButton>
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<ImageView fileId={fileId} />
			</Box>
		</Dialog>
	);
};

export default FilePreview;
