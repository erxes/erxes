import startPlugin from '@erxes/api-utils/src/start-plugin/index';
import configs from './configs';

startPlugin(configs);

process.on('unhandledRejection', function(reason, p) {
  console.log('Unhandled', reason, p); // log all your errors, "unsuppressing" them.
  throw reason; // optional, in case you want to treat these as errors
});
