import {
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
  splitType,
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

  const { triggerType, target } = execution;
  const itemId = target?._id;

  if (!documentId || !itemId) {
    return { documentId, content: '', phone: '', sent: false };
  }

  // Derive the conformity main type from the trigger, e.g. "sales:deal.deal" -> "deal"
  const [, mainModule, mainCollection] = splitType(triggerType || '');
  const mainType = mainCollection || mainModule || '';

  // Find the customers related to the target record
  const customerIds: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'conformity',
    action: 'savedConformity',
    input: { mainType, mainTypeId: itemId, relTypes: ['customer'] },
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

    // Prefer a customer identified by an 8-digit code, otherwise the first one
    const codedCustomer = (customers || []).find(
      (customer: any) => customer?.code && /^\d{8}$/.test(customer.code),
    );
    const customer = codedCustomer || (customers || [])[0];
    customerPhone = customer?.primaryPhone || '';
  }

  // Render the selected document for the target record
  const rendered = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'documents',
    action: 'print',
    input: { _id: documentId, replacerIds: [itemId], config: {} },
    defaultValue: '',
  });

  const content = Array.isArray(rendered) ? rendered.join('') : rendered || '';

  let sent = false;

  if (content && customerPhone) {
    await sendSms(subdomain, 'messagePro', customerPhone, stripHtmlToText(content));
    sent = true;
  }

  return { documentId, content, phone: customerPhone, sent };
};
