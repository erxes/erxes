import { IModels } from './connectionResolver';
import { sendContactsMessage, sendInboxMessage } from './messageBroker';
import { ICustomer } from './models/definitions/customers';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: ICustomer & { recipientId?: String },
) => {
  const { inboxIntegrationId, primaryPhone } = callAccount;
  let customer = await models.Customers.findOne({
    primaryPhone,
  });

  if (!customer) {
    try {
      customer = await models.Customers.create({
        inboxIntegrationId,
        erxesApiId: null,
        primaryPhone: primaryPhone,
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: customer duplication'
          : e,
      );
    }
    try {
      const apiCustomerResponse = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'get-create-update-customer',
          payload: JSON.stringify({
            integrationId: inboxIntegrationId,
            primaryPhone: primaryPhone,
            isUser: true,
            phone: [primaryPhone],
          }),
        },
        isRPC: true,
      });
      customer.erxesApiId = apiCustomerResponse._id;
      await customer.save();
    } catch (e) {
      await models.Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }
    console.log(customer, 'customer');

  if(!customer.erxesApiId){
    console.log(customer, 'customer1')
     const prev = await models.Customers.findOne({ primaryPhone });

     let customerId;

     if (!prev) {
       const lead = await sendContactsMessage({
         subdomain,
         action: 'customers.findOne',
         data: {
           primaryPhone,
         },
         isRPC: true,
       });

       if (lead) {
         customerId = lead._id;
       } else {
         const apiCustomerResponse = await sendContactsMessage({
           subdomain,
           action: 'customers.createCustomer',
           data: {
             integrationId: inboxIntegrationId,
             primaryPhone,
             state: 'lead',
           },
           isRPC: true,
         });

         customerId = apiCustomerResponse._id;
       }

       await models.Customers.create({
         inboxIntegrationId,
         erxesApiId: customerId,
         primaryPhone,
       });
     } else {
       customer.erxesApiId = prev.erxesApiId;
       await customer.save();
     }
  }
    console.log(customer, 'customer2');

  return customer;
};
