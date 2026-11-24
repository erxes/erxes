import { needs } from './policyRules';

/**
 * Payments and eBarimt in the access map (`./policies`): members set them up
 * on Settings › Payments and Integrations; plugins take payments with their
 * `payments:*` scopes.
 */
export const PAYMENT_ACCESS = {
  // Banks: the organisation's accounts. Seeing them and sending money are two
  // permissions (connecting one is Settings › Integrations'); no plugin or
  // API key reaches them.
  'banks.connections': needs('banks.view'),
  'banks.accounts': needs('banks.view'),
  'banks.account': needs('banks.view'),
  'banks.statement': needs('banks.view'),
  'banks.transfers': needs('banks.view'),
  'banks.transfer': needs('banks.transfer'),
  'banks.taxpayer': needs('banks.view'),
  'banks.taxInvoices': needs('banks.view'),
  'payments.gateways': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.quickQrDistricts': needs('payments.manage'),
  'payments.createInvoice': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.recordPayment': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.getInvoice': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.cancelInvoice': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.invoices': needs('payments.manage'),
  'payments.refund': { member: 'payments.refund', plugin: 'payments:write' },
  'payments.refunds': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.settings': needs('payments.manage'),
  'payments.saveSettings': needs('payments.manage'),
  'payments.payTestInvoice': needs('payments.manage'),
  // A plugin lists the configs so its settings can pick one as an invoice's `ebarimtId`.
  'ebarimt.configs': { member: 'integrations.manage', plugin: 'payments:read' },
  'ebarimt.createConfig': needs('integrations.manage'),
  'ebarimt.updateConfig': needs('integrations.manage'),
  'ebarimt.removeConfig': needs('integrations.manage'),
  'ebarimt.testConnection': needs('integrations.manage'),
  'ebarimt.receipts': { member: 'payments.manage', plugin: 'payments:read' },
  // A plugin that sends its own receipts (`taxReceipts: 'own'`) records them in core's register.
  'ebarimt.recordReceipt': { plugin: 'payments:write' },
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
