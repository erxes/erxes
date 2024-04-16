import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import redis from '@erxes/api-utils/src/redis';
import * as crypto from 'crypto';

export const generateToken = async (integrationId, username?, password?) => {
  const secret = process.env.JWT_TOKEN_SECRET || 'secret';

  const token = jwt.sign({ integrationId, username, password }, secret);
  return token;
};

export const getRecordUrl = async () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('1');
  let cookie = await getOrSetCallCookie();
  if (cookie) {
    cookie = cookie.toString();
  }

  console.log(cookie, 'cookie');
  // const listAccount = await fetch('https://crmgs.miat.com:8089/api', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     request: {
  //       action: 'listAccount',
  //       cookie,
  //       item_num: '30',
  //       options: 'extension,account_type,fullname,status,addr',
  //       page: '1',
  //       sidx: 'extension',
  //       sord: 'asc',
  //       // filedir: 'monitor',
  //       // filename: 'auto-1574857256-1003-1004.wav',
  //     },
  //   }),
  // });
  // const data = await listAccount.json();
  // console.log(data.response.account, 'listAccount');

  // const response = await fetch('https://crmgs.miat.com:8089/api', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     request: {
  //       action: 'recapi',
  //       cookie,
  //       format: 'json',
  //       // filename: '2024-03/auto-1710755684-1003-99123569.wav',
  //     },
  //   }),
  // });
  // if (!response.ok) {
  //   throw new Error(`HTTP error! Status: ${response.status}`);
  // }

  // // Assuming the response is JSON, use response.json() to parse it
  // console.log(await response.json(), 'response');
  const cdr = await fetch('https://crmgs.miat.com:8443/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        action: 'cdrapi',
        cookie,
        format: 'json',
        caller: '1001',
        callee: '80786886',
        numRecords: '3',
        tineFilterType: 'Start',
      },
    }),
  });

  console.log(cdr, 'c');
  // const cdrData = await cdr.json();
  // const { cdr_root } = cdrData.response;
  // console.log(JSON.parse(JSON.stringify(cdr_root)), 'cdrData');
  // return cdrData;
};

export const getOrSetCallCookie = async () => {
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const user = 'recApi';
  const pass = 'recApi13';

  const callCookie = await redis.get(`callCookie`);
  if (callCookie) {
    return callCookie;
  }
  const response = await fetch('https://crmgs.miat.com:8089/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        action: 'challenge',
        user,
        version: '1.2',
      },
    }),
  });
  console.log('2');
  const data = await response.json();

  const { challenge } = data?.response;

  const hashedPassword = crypto
    .createHash('md5')
    .update(challenge + pass)
    .digest('hex');

  // .update(challenge + pass)

  // Send a new request to authenticate the user
  const loginResponse = await fetch('https://crmgs.miat.com:8089/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        action: 'login',
        user,
        token: hashedPassword,
      },
    }),
  });

  const loginData = await loginResponse.json();
  const { cookie } = loginData.response;
  console.log(typeof cookie, 'typeof');
  redis.set(`callCookie`, cookie, 'EX', 10 * 60);
  return cookie;
};
