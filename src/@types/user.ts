export interface UserTypeFirebase {
	phoneNumber: string;
	fullName: string;
	folders: FolderType[];
	totalSize: string;
	id: string;
	tgId: string;
}

export interface FolderType {
	name: string;
	id: string;
	totalFiles: number;
	size: string;
	createdAt?: string;
	isFavorited?: boolean;
}

export interface IUserState {
	isLoading: boolean;
	error: Error | string | null,
	user: UserTypeFirebase | null,
}
