import fetch from 'node-fetch';

export const configCodes = {
  username: 'qpayMerchantUser',
  password: 'qpayMerchantPassword',
  invoiceCode: 'qpayInvoiceCode',
  url: 'qpayUrl',
  callback: 'callbackUrl'
};

export const configDescriptions = {
  qpayMerchantUser: 'Merchant username for API',
  qpayMerchantPassword: 'Merchant password for API',
  qpayInvoiceCode: 'Invoice code for Merchant',
  qpayUrl: 'Qpay url for API',
  callbackUrl: 'The callback url for Merchant'
};

export const setQpayConfig = async (code, models, doc) => {
  const _id = Math.random().toString();
  const value = { _id, status: 'active', data: doc };

  const addresses = await models.Configs.findOne({ code });
  const values = addresses ? addresses.value : [];
  values.push(value);

  if (!addresses) {
    await models.Configs.create({ code, value: values });
  } else {
    await models.Configs.updateOne(
      { _id: addresses._id },
      { $set: { value: values } }
    );
  }
  return value;
};

export const delQpayConfigs = async (code, models, doc) => {
  const addresses = await models.Configs.findOne({ code });
  const value = addresses.value;
  const selected = value.filter(function(i) {
    if (i._id === doc._id) {
      i.status = 'inactive';
    }
    return i._id === doc._id || i._id !== doc._id;
  });

  await models.Configs.updateOne({ code }, { $set: { value: selected } });

  return selected;
};

export const getQpayConfigs = async (code, models, _params) => {
  const addresses = await models.Configs.findOne({ code });
  const value = addresses && addresses.value ? addresses.value : [];
  const actives = value.filter(function(i) {
    return i.status === 'active';
  });

  return actives;
};

export const getDataFromConfigById = async (code, ids: [string], configs) => {
  const config = await configs.findOne({ code });
  const values = config.value;

  return values.filter(function(i) {
    return ids.includes(i._id);
  });
};

export const getConfigs = async (configs, key) => {
  const config = await configs.findOne({ code: key });

  if (!config) {
    throw new Error(`Required to config ${configDescriptions[key]}`);
  }

  return config.value;
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

export const fetchUrl = async (url, requestOptions) => {
  let returnData;

  await fetch(`${url}`, requestOptions)
    .then(response => response.text())
    .then(result => {
      try {
        returnData = JSON.parse(result);
      } catch (error) {
        returnData = { error: result };
      }
    })
    .catch(error => console.log('error', error));

  return returnData;
};

export const qpayToken = async configs => {
  const host = await getConfigs(configs, configCodes.url);
  const username = await getConfigs(configs, configCodes.username);
  const password = await getConfigs(configs, configCodes.password);

  const myHeaders = new fetch.Headers();
  const port = '/v2/auth/token';
  myHeaders.append(
    'Authorization',
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  );
  // myHeaders.append("Authorization", "Basic Tk1NQV9PUDpmWnZvTTlKcw==");
  const raw = '';

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  const tokenInfo = await fetchUrl(`${host}${port}`, requestOptions);
  return tokenInfo.access_token;
};

export const createInvoice = async (varData, token, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', 'Bearer ' + token);
  const host = await getConfigs(configs, configCodes.url);
  const port = '/v2/invoice';
  const raw = JSON.stringify(varData);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};

export const deleteInvoice = async (invoiceId, token, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);
  const host = await getConfigs(configs, configCodes.url);
  const port = `/v2/invoice/${invoiceId}`;
  const requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};

export const getQpayInvoice = async (invoiceId, token, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Authorization', 'Bearer ' + token);
  const host = await getConfigs(configs, configCodes.url);
  const port = `/v2/invoice/${invoiceId}`;

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};

export const checkQpayPayment = async (varData, token, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', `Bearer ${token}`);
  const host = await getConfigs(configs, configCodes.url);
  const port = `/v2/payment/check`;
  const raw = JSON.stringify(varData);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};

export const listQpayPayment = async (varData, token, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', `Bearer ${token}`);
  const host = await getConfigs(configs, configCodes.url);
  const port = `/v2/payment/list`;
  const raw = JSON.stringify(varData);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};

export const deleteQpayPayment = async (
  paymentId,
  description,
  token,
  configs
) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);
  myHeaders.append('Content-Type', 'application/json');
  const host = await getConfigs(configs, configCodes.url);
  const port = `/v2/payment/cancel/${paymentId}`;
  const raw = JSON.stringify({
    callback_url: `https://qpay.mn/payment/result?payment_id=${paymentId}`,
    note: description
  });

  const requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};

export const getQpayNuat = async (varData, token, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);
  myHeaders.append('Content-Type', 'application/json');
  const host = await getConfigs(configs, configCodes.url);
  const port = `/ebarimt/create`;
  const raw = JSON.stringify(varData);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${host}${port}`, requestOptions);
};
