/* eslint-disable no-prototype-builtins */
/* eslint-disable no-useless-catch */
import { initializeApp } from 'firebase/app';
import {
	addDoc,
	collection,
	doc,
	Firestore,
	getDoc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	updateDoc,
	where,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { FolderType, UserTypeFirebase } from '../@types/user';
import { FIREBASE_API } from '../config-global';

export const app = initializeApp(FIREBASE_API);

export const db = getFirestore();
export const auth = getAuth();

export class BaseModel {
	protected db: Firestore;
	protected collection: string;

	constructor(db: Firestore, collection: string) {
		this.db = db;
		this.collection = collection;
	}

	async findOne(id: string) {
		try {
			const docRef = doc(this.db, this.collection, id);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				return docSnap.data();
			} else {
				return null;
			}
		} catch (error: any) {
			throw error;
		}
	}

	async create(data: object, id?: string) {
		try {
			if (id) {
				const docRef = doc(this.db, this.collection, id);
				await setDoc(docRef, data);
				return { id, ...data };
			} else {
				const colRef = collection(this.db, this.collection);
				const docRef = await addDoc(colRef, data);
				return { id: docRef.id, ...data };
			}
		} catch (error: any) {
			throw error;
		}
	}

	async findByTgId(tgId: string): Promise<any> {
		try {
			await signInAnonymously(auth);
			const colRef = collection(this.db, this.collection);
			const q = query(colRef, where('tgId', '==', tgId));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const doc = querySnapshot.docs[0];
				return { id: doc.id, ...doc.data() };
			} else {
				return null;
			}
		} catch (error: any) {
			throw error;
		}
	}

	async findByTgIdOrCreate(tgId: string, data: Partial<UserTypeFirebase>) {
		try {
			// await signInAnonymously(auth);
			const existingUser = await this.findByTgId(tgId);

			if (existingUser) {
				let needsUpdate = false;
				const updatedUser = { ...existingUser };

				for (const key in data) {
					if (data.hasOwnProperty(key) && !existingUser.hasOwnProperty(key)) {
						updatedUser[key as keyof UserTypeFirebase] = data[key as keyof UserTypeFirebase];
						needsUpdate = true;
					}
				}
				if (needsUpdate) {
					await this.findByIdAndUpdate(existingUser.id, updatedUser);
				}
				return existingUser;
			} else {
				const newUser = await this.create({
					tgId,
					...data,
					folders: data.folders || [],
				});
				return newUser;
			}
		} catch (error: any) {
			throw error;
		}
	}

	async findByIdAndUpdate(id: string, data: Partial<UserTypeFirebase>) {
		try {
			await signInAnonymously(auth);
			const docRef = doc(this.db, this.collection, id);
			await updateDoc(docRef, data);
			return { id: id, ...data };
		} catch (error: any) {
			throw error;
		}
	}
}

export class User extends BaseModel {
	constructor(db: Firestore) {
		super(db, 'Users');
	}
}

export const userModel = new User(db);

// Get subfolder folder ids with current folder id
export const getAllFolderIds = (folders: FolderType[] = [], targetId: string): string[] => {
	const result: string[] = [];

	function collectIds(folder: FolderType): void {
		result.push(folder.id);
		if (folder.folders?.length) {
			folder.folders.forEach(collectIds);
		}
	}

	function findAndCollect(folders: FolderType[]): void {
		for (const folder of folders) {
			if (folder.id === targetId) {
				collectIds(folder);
				break;
			} else if (folder.folders?.length) {
				findAndCollect(folder.folders);
			}
		}
	}

	findAndCollect(folders);
	return result;
};

// Function to delete folders by IDs
export function deleteFoldersById(folders: FolderType[] = [], folderIds: string[]): FolderType[] {
	return folders
		.filter((folder) => !folderIds.includes(folder.id))
		.map((folder) => {
			if (folder.folders?.length) {
				return {
					...folder,
					folders: deleteFoldersById(folder.folders, folderIds),
				};
			}
			return folder;
		});
}
