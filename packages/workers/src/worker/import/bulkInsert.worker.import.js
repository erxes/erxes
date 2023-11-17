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
  const filePath = path.resolve(__dirname, `./bulkInsert.worker.ts`);

  return filePath;
};

try {
  require(path.resolve(__dirname, `${getWorkerFile()}`));
} catch (e) {
  console.log(e);
}
