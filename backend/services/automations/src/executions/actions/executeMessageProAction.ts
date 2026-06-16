import {
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { sendSms } from '../../utils/sms';

const stripHtmlToText = (html: string) =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(
      /<\/?[a-z][\w-]*(?:\s+[a-z-]+(?:=(?:"[^"]*"|'[^']*'|[^>\s]+))?)*\s*\/?>/gi,
      '',
    )
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Message Pro: renders a selected document with the target record, resolves the
 * related customer's phone, strips the rendered HTML to plain text and sends it
 * as an SMS through the MessagePro gateway.
 */
export const executeMessageProAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
) => {
  const resolvedConfig = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });

  const documentId =
    typeof resolvedConfig.documentId === 'string'
      ? resolvedConfig.documentId
      : '';

  const { target } = execution;
  const itemId = target?._id;

  if (!documentId || !itemId) {
    return { documentId, content: '', phone: '', sent: false };
  }


  const customerIds: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: 'sales:deal',
      contentId: itemId,
      relatedContentType: 'core:customer',
    },
    defaultValue: [],
  });

  let customerPhone = '';

  if (customerIds?.length) {
    const customers = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findActiveCustomers',
      input: {
        query: { _id: { $in: customerIds } },
        fields: {
          _id: 1,
          code: 1,
          firstName: 1,
          lastName: 1,
          primaryEmail: 1,
          primaryPhone: 1,
        },
      },
      defaultValue: [],
    });

    const codedCustomer = (customers || []).find(
      (customer: any) => customer?.code && /^\d{8}$/.test(customer.code),
    );
    const customer = codedCustomer || (customers || [])[0];
    customerPhone = customer?.primaryPhone || '';
  }

const document = await sendTRPCMessage({
  subdomain,
  pluginName: 'core',
  method: 'query',
  module: 'documents',
  action: 'print',
  input: {
    _id: documentId,
    replacerIds: [itemId],
    config: {},
  },
  defaultValue: '',
});

let sent = false;
let cleanedText = '';

if (document) {
  const htmlContent = Array.isArray(document)
    ? document.join('')
    : String(document);

  cleanedText = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

if (cleanedText && customerPhone) {
  await sendSms(
    subdomain,
    'messagePro',
    customerPhone,
    cleanedText,
  );

  sent = true;
}

return {
  documentId,
  content: cleanedText,
  phone: customerPhone,
  sent,
};
};
