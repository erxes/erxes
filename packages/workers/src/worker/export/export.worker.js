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
  let filePath = path.resolve(__dirname, `./export.worker.js`);

  if (process.env.NODE_ENV !== 'production') {
    filePath = path.resolve(__dirname, `./export.worker.ts`);
  }

  return filePath;
};

try {
  require(path.resolve('erxes/packages/workers', `${getWorkerFile()}`));
} catch (e) {
  console.log(e);
}
