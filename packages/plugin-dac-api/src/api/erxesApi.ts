import { sendContactsMessage } from '../messageBroker';

export const getCustomer = async (req, res, subdomain) => {
  const phoneNumber = req.query.phone;

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      primaryPhone: phoneNumber
    },
    isRPC: true,
    defaultValue: null
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // export const createCustomer = async (subdomain: string, req, res) => {
  //   const { body } = req;

  //   return res.send('ok');
};
