import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || 'ball_kho_gayi_xi';

if (!uri) {
  throw new Error('MONGODB_URI environment variable is missing.');
}

const globalCache = globalThis;

if (!globalCache.__ballKhoGayiMongoPromise) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  globalCache.__ballKhoGayiMongoPromise = client.connect();
}

export async function getDatabase() {
  const client = await globalCache.__ballKhoGayiMongoPromise;
  return client.db(databaseName);
}
