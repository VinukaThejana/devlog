import {
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';

// Upload state to the firebase storage
export type IStorageUploadState = 'paused' | 'running' | 'canceled' | undefined;

export interface IUserDocument {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  username: string;
  posts: number;
}

export interface IPostDocument {
  content: string;
  createdAt: Date;
  published: boolean;
  slug: string;
  title: string;
  uid: string;
  hearts: number;
  updatedAt: Date;
  username: string;
  summary: string;
}

export interface IProviderData {
  displayName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  providerId: string;
  uid: string;
}

export type ProviderTypes =
  | 'password'
  | 'google.com'
  | 'twitter.com'
  | 'github.com';

export type Provider =
  | GoogleAuthProvider
  | GithubAuthProvider
  | TwitterAuthProvider;
