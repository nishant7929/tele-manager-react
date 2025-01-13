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

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_apiKey,
	authDomain: process.env.REACT_APP_FIREBASE_authDomain,
	projectId: process.env.REACT_APP_FIREBASE_projectId,
	storageBucket: process.env.REACT_APP_FIREBASE_storageBucket,
	messagingSenderId: process.env.REACT_APP_FIREBASE_messagingSenderId,
	appId: process.env.REACT_APP_FIREBASE_appId,
	measurementId: process.env.REACT_APP_FIREBASE_measurementId,
};

export const app = initializeApp(firebaseConfig);

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

	async findByPhoneNumber(phoneNumber: string): Promise<any> {
		try {
			const colRef = collection(this.db, this.collection);
			const q = query(colRef, where('phoneNumber', '==', phoneNumber));
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

	async findByPhoneOrCreate(phoneNumber: string, data: Partial<UserTypeFirebase>) {
		try {
			const existingUser = await this.findByPhoneNumber(phoneNumber);

			if (existingUser) {
				return existingUser;
			} else {
				const newUser = await this.create({
					phoneNumber,
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
