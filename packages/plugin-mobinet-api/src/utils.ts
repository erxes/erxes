import fetch from 'node-fetch';

const sendSms = async (phone, message) => {
  // check message length and split then send multiple sms
  if (message.length > 160) {
    const messages = message.match(/.{1,160}/g);
    for (const msg of messages) {
      await sendSms(phone, msg);
    }
    return;
  }

  const url = `http://27.123.214.168/smsmt/mt?servicename=132222&username=132222&from=13222&to=${phone}&msg=${message}`;
  const response = await fetch(url, {
    method: 'GET'
  });

  if (response.status !== 200) {
    throw new Error('Failed to send sms');
  }

  const res = await response.text();

  console.log('*************** mobinet:sendSms response', res);

  if (res.includes('Sent')) {
    return 'ok';
  }

  throw new Error(res);
};

export { sendSms };
