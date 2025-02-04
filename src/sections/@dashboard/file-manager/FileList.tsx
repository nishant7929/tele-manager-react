import React from 'react';
// @mui
import { Box, BoxProps, Button } from '@mui/material';
// components
import { SkeletonProductItem } from '../../../components/skeleton';
//
import FileCard from './FileCard';
import { IImageData } from '../../../pages/dashboard/FileListPage';
import FileActionSelected from '../file/portal/FileActionSelected';
import { TableProps } from '../../../components/table';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
	table: TableProps;
	files: IImageData[];
	loading: boolean;
	onOpenConfirm?: VoidFunction;
	onFileClick: (__id: number) => void;
}

export default function FileList({ files, loading, onOpenConfirm, table, onFileClick, ...other }: Props) {
	const { selected, onSelectRow: onSelectItem } = table;
	return (
		<React.Fragment>
			<Box
				gap={1}
				display="grid"
				gridTemplateColumns={{
					xs: 'repeat(2, 1fr)',
					sm: 'repeat(3, 1fr)',
					md: 'repeat(4, 1fr)',
					lg: 'repeat(5, 1fr)',
				}}
				{...other}
			>
				{(loading ? [...Array(20)] : [...files]).map((file, index) =>
					file ? (
						<FileCard
							key={index}
							file={file}
							selected={selected.includes(file.id)}
							onSelect={() => onSelectItem(file.id)}
							onClick={() => onFileClick(file.id)}
						/>
					) : (
						<SkeletonProductItem key={index} />
					)
				)}
			</Box>

			{!!selected?.length && (
				<FileActionSelected
					selected={selected}
					action={
						<>
							<Button
								size="small"
								color="error"
								variant="contained"
								startIcon={<Iconify icon="eva:trash-2-outline" />}
								onClick={onOpenConfirm}
								sx={{ mr: 1 }}
							>
								Delete
							</Button>
						</>
					}
				/>
			)}
		</React.Fragment>
	);
}
