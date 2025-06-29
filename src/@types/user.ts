export interface UserTypeFirebase {
	phoneNumber: string;
	fullName: string;
	folders: FolderType[];
	uid: string;
	tgId: string;
	createdAt?: string;
	updatedAt?: string;
	totalFiles?: number;
	totalSize?: string;
}

export interface FolderType {
	name: string;
	id: string;
	createdAt?: string;
	updatedAt?: string;
	folders?: FolderType[];
}

export interface IUserState {
	isLoading: boolean;
	error: Error | string | null;
	user: UserTypeFirebase | null;
}
