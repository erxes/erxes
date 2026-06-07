import configQueries from './configs';
import accountQueries from './accounts';
import fetch from 'node-fetch';

export default {
  ...configQueries,
  ...accountQueries,

  khanbankRates: async (_root, _args, _context) => {
    try {
      return await fetch('https://api.khanbank.com/v1/rates').then((res) =>
        res.json(),
      );
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  },
};
