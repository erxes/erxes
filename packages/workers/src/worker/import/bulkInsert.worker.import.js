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

const getWorkerFile = () => {
  if (process.env.NODE_ENV !== 'production') {
    return './bulkInsert.worker.ts';
  }

  return './bulkInsert.worker.js';
};

try {
  require(path.resolve(__dirname, `${getWorkerFile()}`));
} catch (e) {
  console.log(e);
}
