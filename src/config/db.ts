import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;

  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    throw new Error(
      "MONGO_URI or DB_NAME is not defined in environment variables",
    );
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log(`MongoDB connected: ${dbName}`);
  return db;
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};
