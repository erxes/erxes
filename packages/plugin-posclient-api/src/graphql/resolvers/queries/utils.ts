import { debugError } from '@erxes/api-utils/src/debuggers';
import * as request from 'request';
// import Cors from 'cors';

type Params = {
  name: string;
  query: string;
  variables?: { [key: string]: string };
};

export const sendGraphQLRequest = ({ query, variables, name }: Params) => {
  const { REACT_APP_MAIN_API_DOMAIN } = process.env;

  try {
    return new Promise((resolve, reject) => {
      request(
        {
          url: `${REACT_APP_MAIN_API_DOMAIN}/graphql`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables })
        },
        (error, _response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(`Could not fetch ${name}`);
          }

          const response = JSON.parse(body || '{}');

          const { errors, data = {} } = response || {};

          if (errors) {
            if (errors.length > 0) {
              return reject(errors[0].message);
            }

            return reject(errors);
          }

          return resolve(data[name]);
        }
      );
    });
  } catch (e) {
    debugError(`Error occurred during graphql to erxes: ${e.message}`);
  }
};

export function corsMiddleware(req, res) {
  // const POS_UI_DOMAIN = getEnv({ name: 'POS_UI_DOMAIN' });
  // const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  // const cors = Cors({
  //   credentials: true,
  //   origin: [...(POS_UI_DOMAIN || '').split(','), MAIN_APP_DOMAIN]
  // });

  return new Promise((resolve, reject) => {
    // cors(req, res, result => {
    //   if (result instanceof Error) {
    //     return reject(result);
    //   }
    //   return resolve(result);
    // });
  });
}
