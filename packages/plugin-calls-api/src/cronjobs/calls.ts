import { getEnv } from '@erxes/api-utils/src';

export default {
  // handleMinutelyJob: async ({ subdomain }) => {
  //   const VERSION = getEnv({ name: 'VERSION' });

  //   console.log('minutely ...');
  // },
  handle3SecondlyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: 'VERSION' });

    //console.log('3 secondly ...');
  },
};
