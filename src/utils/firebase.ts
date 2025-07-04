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

	async findOne(uid: string): Promise<any> {
		try {
			const docRef = doc(this.db, this.collection, uid);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				return { uid: uid, ...docSnap.data() };
			} else {
				return null;
			}
		} catch (error: any) {
			throw error;
		}
	}

	async findAll() {
		try {
			const colRef = collection(db, this.collection);
			const querySnapshot = await getDocs(colRef);

			const records = querySnapshot.docs.map((doc) => ({
				uid: doc.id,
				...doc.data(),
			}));

			return records;
		} catch (error) {
			console.error('Error fetching records:', error);
			throw error;
		}
	}

	async create(data: object, uid?: string) {
		try {
			if (uid) {
				const docRef = doc(this.db, this.collection, uid);
				await setDoc(docRef, data);
				return { uid: uid, ...data };
			} else {
				const colRef = collection(this.db, this.collection);
				const docRef = await addDoc(colRef, data);
				return { uid: docRef.id, ...data };
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

	async findByIdOrCreate(uid: string, data: Partial<UserTypeFirebase>) {
		try {
			// await signInAnonymously(auth);
			const existingUser = await this.findOne(uid);
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
					await this.findByIdAndUpdate(existingUser.uid, updatedUser);
				}
				return existingUser;
			} else {
				const newUser = await this.create(
					{
						...data,
						folders: data.folders || [],
					},
					uid
				);
				return newUser;
			}
		} catch (error: any) {
			throw error;
		}
	}

	async findByIdAndUpdate(uid: string, data: Partial<UserTypeFirebase>) {
		try {
			await signInAnonymously(auth);
			const docRef = doc(this.db, this.collection, uid);
			await updateDoc(docRef, data);
			return { uid: uid, ...data };
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
