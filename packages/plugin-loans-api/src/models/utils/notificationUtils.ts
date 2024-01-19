import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import {
  sendCoreMessage,
  sendMessageBroker,
  sendSms
} from '../../messageBroker';
import { IContractDocument } from '../definitions/contracts';
import { IInvoiceDocument } from '../definitions/invoices';

export async function sendNotification(
  subdomain: string,
  contract: IContractDocument,
  invoice: IInvoiceDocument
) {
  const isEnabledClientPortal = await isEnabled('clientportal');

  const isSms = await isEnabled('sms');

  const isEmail = await isEnabled('email');

  const customer = await sendMessageBroker(
    {
      subdomain,
      action: 'customers.findOne',
      data: { _id: contract.customerId },
      isRPC: true
    },
    'contacts'
  );

  if (isEnabledClientPortal) {
    sendMessageBroker(
      {
        subdomain,
        data: {
          receivers: contract.customerId,
          title: `Мэдэгдэл`,
          content: `${contract.number} гэрээний эргэн төлөлт ${invoice.total} тул та хугцаандаа эргэн төлөлт өө хийнэ үү `,
          notifType: 'system',
          link: ''
        },
        action: 'sendNotification'
      },
      'clientportal'
    );
  }

  if (isSms && customer.phoneNumber) {
    sendSms(
      subdomain,
      'messagePro',
      customer.phoneNumber,
      `${contract.number} гэрээний эргэн төлөлт ${invoice.total} тул та хугцаандаа эргэн төлөлт өө хийнэ үү`
    );
  }

  if (isEmail && customer.email) {
    await sendCoreMessage({
      subdomain,
      action: 'sendEmail',
      data: {
        toEmails: [customer.email],
        fromEmail: 'info@erxes.io',
        title: `Мэдэгдэл`,
        template: {
          data: {
            content: `${contract.number} гэрээний эргэн төлөлт ${invoice.total} тул та хугцаандаа эргэн төлөлт өө хийнэ үү`
          }
        }
        //   attachments: mailAttachment
      }
    });
  }
}
