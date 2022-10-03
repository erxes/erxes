import { getSubdomain } from '@erxes/api-utils/src/core';

import { PAYMENT_TYPES } from '../constants';
import { qPayHandler } from './api/qPay/utils';
import { socialPayHandler } from './api/socialPay/utils';
import { graphqlPubsub } from './configs';
import { generateModels } from './connectionResolver';

export const getHandler = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { query } = req;
  const { type } = query;

  if (!type) {
    return res.status(400).send('Type is required');
  }

  try {
    let invoice: any;
    switch (type) {
      case PAYMENT_TYPES.QPAY:
        invoice = await qPayHandler(models, query);
    }

    if (invoice) {
      graphqlPubsub.publish('invoiceUpdated', {
        invoiceUpdated: {
          _id: invoice._id,
          status: 'paid'
        }
      });
    }
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};

export const postHandler = async (req, res) => {
  const { route } = req;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { body } = req;

  const type = route.path
    .split('/')
    .slice(-1)
    .pop();

  try {
    let invoice: any;
    switch (type) {
      case PAYMENT_TYPES.SOCIAL_PAY:
        invoice = await socialPayHandler(models, body);
    }

    if (invoice) {
      graphqlPubsub.publish('invoiceUpdated', {
        invoiceUpdated: {
          _id: invoice._id,
          status: 'paid'
        }
      });
    }
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};

export const makeInvoiceNo = length => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// const pathReplacer = (subdomain: string, html: any, site: ISiteDocument) => {
//   const siteHolder = `{{sitename}}`;
//   const path = `{{pl:webbuilder}}/`;

//   if (html.includes(siteHolder)) {
//     html = html.replace(new RegExp(siteHolder, 'g'), site.name);
//   }

//   if (html.includes(path)) {
//     if (site.domain && site.domain.includes('http')) {
//       html = html.replace(new RegExp(path, 'g'), '');
//     }

//     // path replacer
//     const replacer =
//       subdomain === 'localhost' ? `pl:webbuilder/` : `gateway/pl:webbuilder/`;

//     html = html.replace(new RegExp(path, 'g'), replacer);
//   }

//   return html;
// };

const html = ({ body }: { body: string }) => `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body style="margin:0">
      <div id="app">${body}</div>
    </body>
    <script src="js/client.js" defer></script>
  </html>
`;

export default html;
