import configs from './configs';
import startServer from '@erxes/api-utils/src/server';

try {
    console.log("--------------------------------------")
    await startServer(configs);
} catch (e) {
    console.log("--------------------------------------")
    throw e;
}
