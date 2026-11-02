import { randomUUID } from 'node:crypto';

// Imported first: the shared mongo module reads MONGO_URL once, on load
export const DATABASE = `erxes_support_access_test_${randomUUID().replace(/-/g, '')}`;

process.env.MONGO_URL = `mongodb://127.0.0.1:27017/${DATABASE}?directConnection=true`;
