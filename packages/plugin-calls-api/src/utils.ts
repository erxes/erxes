import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import redis from '@erxes/api-utils/src/redis';
import { getEnv } from '@erxes/api-utils/src/core';
import * as FormData from 'form-data';
import * as fs from 'fs'
import * as path from 'path';


export const generateToken = async (integrationId, username?, password?) => {
  const secret = process.env.JWT_TOKEN_SECRET || 'secret';

  const token = jwt.sign({ integrationId, username, password }, secret);
  return token;
};

export const getRecordUrl = async (subdomain) => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('1');
  let cookie = await getOrSetCallCookie();
  cookie = cookie.toString();
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

  // const records = await fetch('https://crmgs.miat.com:8089/api', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },

  //   body: JSON.stringify({
  //     request: {
  //       action: 'recapi',
  //       cookie,
  //       filedir: 'monitor',
  //       filename: 'auto-1710829068-1003-99123569.wav',
  //     },
  //   }),
  // });

  // // console.log(records, 'records');
  // if (!records.ok) {
  //   throw new Error(`HTTP error! status: ${records.status}`);
  // }
  // // console.log(await records.text(), 'records');
  // const buffer = await records.arrayBuffer();

  // // Now you can work with the buffer as needed
  // // const jsonString = new TextDecoder().decode(buffer);
  // // const jsonObject = JSON.parse(JSON.stringify(jsonString));

  // // console.log(jsonObject); // const recData = await records.json();
  // // console.log(buffer, 'buffer');
  // const domain = getEnv({name: 'DOMAIN', subdomain, defaultValue: 'http://localhost:4000'});
  // const uploadUrl = domain.includes('localhost')
  //   ? `${domain}/pl:core/upload-file`
  //   : `${domain}/gateway/pl:core/upload-file`;
   

  //   const file_blob = new Blob([Buffer.from(buffer)], { type: 'wav' });

  //   const formData = new FormData();
  //   // formData.append('file', file_blob, "record.wav");
  //   formData.append('file', Buffer.from(buffer), { filename: 'record.wav' });


  //     const rec = await fetch(uploadUrl, {
  //       method: 'POST',
  //       body: formData
  //     });
  //     const fileUrl = await rec.text();
  //     console.log(fileUrl, 'rec');






    // path.join(__dirname, '/public');
    // fs.writeFileSync(path.join(__dirname, '/a.wav'), Buffer.from(buffer));
  // console.log(records, 'records');
  // if (!records.ok) {
  //   throw new Error(`HTTP error! Status: ${records.status}`);
  // }
const formData = new URLSearchParams();
formData.append('action', 'listCDRDB');
formData.append('page', '1');
formData.append('sord', 'desc');
formData.append('src', '80786886');
formData.append('sidx', 'start');
formData.append('item_num', "10");
formData.append('fromtime', '2024-04-01');
formData.append('totime', '2024-05-01');
formData.append('dst', '70003633');
// formData.append('cookie', cookie);



  const cdr = await fetch('https://crmgs.miat.com:8089/cgi?', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: formData,
  });

  console.log(await cdr.json(), 'cdr');

  // const cdr = await fetch('https://crmgs.miat.com:8089/api', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     request: {
  //       action: 'cdrapi',
  //       cookie,
  //       format: 'json',
  //       caller: '1003',
  //       callee: '99123569',
  //       numRecords: '10',
  //       tineFilterType: 'End',
  //       sord: 'desc',
  //       sidx: 'start',
  //     },
  //   }),
  // });

  // console.log(cdr, 'c');
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
