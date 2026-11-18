import { needs } from './policyRules';

/**
 * Payments and eBarimt in the access map (`./policies`): members set them up
 * on Settings › Payments and Integrations; plugins take payments with their
 * `payments:*` scopes.
 */
export const PAYMENT_ACCESS = {
  'payments.gateways': needs('payments.manage'),
  'payments.addGateway': needs('payments.manage'),
  'payments.updateGateway': needs('payments.manage'),
  'payments.removeGateway': needs('payments.manage'),
  'payments.createInvoice': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.recordPayment': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.getInvoice': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.cancelInvoice': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.invoices': needs('payments.manage'),
  'payments.refund': { member: 'payments.refund', plugin: 'payments:write' },
  'payments.refunds': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.pluginSettings': needs('payments.manage'),
  'payments.updatePluginSettings': needs('payments.manage'),
  'payments.payTestInvoice': needs('payments.manage'),
  'ebarimt.settings': needs('integrations.manage'),
  'ebarimt.plugins': needs('integrations.manage'),
  'ebarimt.saveSettings': needs('integrations.manage'),
  'ebarimt.removeSettings': needs('integrations.manage'),
  'ebarimt.testConnection': needs('integrations.manage'),
  'ebarimt.receipts': { member: 'payments.manage', plugin: 'payments:read' },
  'ebarimt.sync': { member: 'payments.manage', plugin: 'payments:write' },
  'ebarimt.setBuyer': { member: 'payments.manage', plugin: 'payments:write' },
  'ebarimt.findCompany': { member: 'any', plugin: 'payments:read' },
  'ebarimt.printTemplates': needs('integrations.manage'),
  'ebarimt.savePrintTemplate': needs('integrations.manage'),
  'ebarimt.resetPrintTemplate': needs('integrations.manage'),
  'ebarimt.previewPrint': needs('integrations.manage'),
  'ebarimt.printReceipt': { member: 'payments.manage', plugin: 'payments:read' },
  'ebarimt.emailReceipt': { member: 'payments.manage', plugin: 'payments:write' },
} as const;
