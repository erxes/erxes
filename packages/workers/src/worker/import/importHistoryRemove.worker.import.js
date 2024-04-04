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
    return './importHistoryRemove.worker.ts';
  }

  return './importHistoryRemove.worker.js';
};

try {
  require(path.resolve(__dirname, `${getWorkerFile()}`));
} catch (e) {
  console.log(e);
}
