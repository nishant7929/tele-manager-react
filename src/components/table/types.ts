// ----------------------------------------------------------------------

export type TableProps = {
	dense: boolean;
	page: number;
	rowsPerPage: number;
	order: 'asc' | 'desc';
	orderBy: string;
	//
	selected: string[];
	onSelectRow: (_id: string) => void;
	onSelectAllRows: (_checked: boolean, _newSelecteds: string[]) => void;
	//
	onSort: (_id: string) => void;
	onChangePage: (_event: unknown, _newPage: number) => void;
	onChangeRowsPerPage: (_event: React.ChangeEvent<HTMLInputElement>) => void;
	onChangeDense: (_event: React.ChangeEvent<HTMLInputElement>) => void;
	//
	setPage: React.Dispatch<React.SetStateAction<number>>;
	setDense: React.Dispatch<React.SetStateAction<boolean>>;
	setOrder: React.Dispatch<React.SetStateAction<'desc' | 'asc'>>;
	setOrderBy: React.Dispatch<React.SetStateAction<string>>;
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
	setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
};
