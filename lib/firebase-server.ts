import { Storage } from 'firebase-admin/lib/storage/storage';
import { NextApiResponse } from 'next';

/**
 * @description - This function deleted all the folders nested within the given folder path
 * including all the files and the folder itself
 * */
export const deleteFolders = async (storage: Storage, path: string) => {
  await storage.bucket().deleteFiles({
    prefix: path,
  });
};

/**
 * @description - Delete a given collection in the firestore database
 * */
export const deleteCollection = async (
  db: FirebaseFirestore.Firestore,
  collectionPath: string,
  batchSize: number,
  res: NextApiResponse
) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve) => {
    deleteQueryBatch(db, query, resolve);
  }).catch((error) => {
    console.log(error);
    return res.status(500);
  });
};

const deleteQueryBatch = async (
  db: FirebaseFirestore.Firestore,
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  resolve: any
) => {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  // Delete documents in batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
};
