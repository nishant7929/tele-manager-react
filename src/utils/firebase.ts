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
import { getAuth } from 'firebase/auth';
import { UserTypeFirebase } from '../@types/user';
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
