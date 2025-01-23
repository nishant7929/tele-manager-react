import { useState, useRef } from 'react';
// @mui
import { Box } from '@mui/material';
// @types
import { FolderType } from '../../../../@types/user';
// components
import { TableProps } from '../../../../components/table';
//
import FileFolderCard from '../item/FileFolderCard';
import FileShareDialog from '../portal/FileShareDialog';
import FileNewFolderDialog from '../portal/FileNewFolderDialog';
import { SkeletonProductItem } from '../../../../components/skeleton';

// ----------------------------------------------------------------------

type Props = {
	loading: boolean;
	table: TableProps;
	data: FolderType[];
	onOpenConfirm?: VoidFunction;
	onDeleteItem?: (__id: string) => void;
};

export default function FileGridView({ loading, table, data }: Props) {

	const { selected, onSelectRow: onSelectItem } = table;

	const containerRef = useRef(null);


	const [inviteEmail, setInviteEmail] = useState('');

	const [openShare, setOpenShare] = useState(false);

	const [openUploadFile, setOpenUploadFile] = useState(false);

	const handleCloseShare = () => {
		setOpenShare(false);
	};

	const handleCloseUploadFile = () => {
		setOpenUploadFile(false);
	};

	const handleChangeInvite = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInviteEmail(event.target.value);
	};

	return (
		<>
			<Box ref={containerRef}>

				<Box
					gap={3}
					display="grid"
					gridTemplateColumns={{
						xs: 'repeat(2, 1fr)',
						sm: 'repeat(3, 1fr)',
						md: 'repeat(4, 1fr)',
						lg: 'repeat(5, 1fr)',
					}}
				>
					{loading
						? [...Array(4)].map((_, index) => (
							<SkeletonProductItem sx={{ height: '140px' }} key={index} />
							  ))
						: data?.map((folder) => (
							<FileFolderCard
								key={folder.id}
								folder={folder}
								selected={selected.includes(folder.id)}
								onSelect={() => onSelectItem(folder.id)}
								sx={{ maxWidth: 'auto' }}
							/>
							  ))}
				</Box>
			</Box>

			<FileShareDialog
				open={openShare}
				inviteEmail={inviteEmail}
				onChangeInvite={handleChangeInvite}
				onClose={() => {
					handleCloseShare();
					setInviteEmail('');
				}}
			/>

			<FileNewFolderDialog open={openUploadFile} onClose={handleCloseUploadFile} />

		</>
	);
}
