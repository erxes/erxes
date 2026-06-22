// Integration specs boot a real mongod via mongodb-memory-server. On the first CI
// run the mongod binary is downloaded, so allow generous time for setup hooks.
jest.setTimeout(60000);
