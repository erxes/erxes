const path = require('path');

try {
  require('ts-node').register({
    compilerOptions: {
      experimentalDecorators: false,
    },
    files: ['./sendEmail.worker.ts'],
    transpileOnly: true,
  });
} catch (e) {
  console.log('register error', e);
}

try {
  require(path.resolve(__dirname, './sendEmail.worker.ts'));
} catch (e) {
  console.log(e);
}
