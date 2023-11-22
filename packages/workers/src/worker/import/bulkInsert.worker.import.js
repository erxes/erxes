const path = require('path');

try {
  require('ts-node').register({
    compilerOptions: {
      experimentalDecorators: false
    },
    transpileOnly: true
  });
} catch (e) {
  console.log('register error', e.message);
}

let filePath = path.resolve(__dirname, `./bulkInsert.worker.js`);

if (process.env.NODE_ENV !== 'production') {
  filePath = path.resolve(__dirname, `./bulkInsert.worker.ts`);
}

try {
  require(path.resolve(__dirname, `${getWorkerFile()}`));
} catch (e) {
  console.log(e);
}
