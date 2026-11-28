import { CONTACT_EVENT_TYPES } from './contactEventTypes';
import {
  APP_TRIGGER_FAILED_DATA,
  AUTOMATION_FAILED_DATA,
  INTEGRATION_CHANGED_DATA,
  INVOICE_DATA,
  INVOICE_PAID_DATA,
  INVOICE_REFUNDED_DATA,
  NOTE_DATA,
  PRODUCT_DATA,
  RECEIPT_DATA,
  SUPPRESSION_DATA,
} from './eventData';
import { type CoreEventType, event } from './eventTypeInfo';

/**
 * Events core publishes (plugins add theirs through their manifest). Webhooks
 * subscribe to them; automations start from them.
 */
export const CORE_EVENT_TYPES = [
  ...CONTACT_EVENT_TYPES,
  {
    ...event(
      'core.product.created',
      'Product added',
      null,
      'A product is added to the catalog (by a member or a plugin)',
    ),
    ...PRODUCT_DATA,
  },
  {
    ...event(
      'core.product.updated',
      'Product updated',
      null,
      'A product’s fields, or the plugins that use it, change',
    ),
    ...PRODUCT_DATA,
  },
  {
    ...event(
      'core.product.archived',
      'Product archived',
      null,
      'A product is taken out of lists; orders keep it',
    ),
    ...PRODUCT_DATA,
  },
  {
    ...event(
      'core.product.restored',
      'Product restored',
      null,
      'An archived product is back in lists',
    ),
    ...PRODUCT_DATA,
  },
  {
    ...event(
      'core.customer.note_added',
      'Note added to a customer',
      'customer',
      'A member adds a note to a person',
    ),
    ...NOTE_DATA,
  },
  {
    ...event(
      'core.company.note_added',
      'Note added to a company',
      'company',
      'A member adds a note to a company',
    ),
    ...NOTE_DATA,
  },
  {
    ...event(
      'core.payment.created',
      'Invoice created',
      null,
      'An invoice is opened, or a payment taken outside a gateway is recorded',
    ),
    ...INVOICE_DATA,
  },
  {
    ...event('core.payment.paid', 'Invoice paid', null, 'An invoice is paid'),
    ...INVOICE_PAID_DATA,
  },
  {
    ...event('core.payment.cancelled', 'Invoice cancelled', null, 'An invoice is cancelled'),
    ...INVOICE_DATA,
  },
  {
    ...event('core.payment.expired', 'Invoice expired unpaid', null, 'An invoice expires unpaid'),
    ...INVOICE_DATA,
  },
  {
    ...event(
      'core.payment.refunded',
      'Payment refunded',
      null,
      'A payment is refunded, in part or in full',
    ),
    ...INVOICE_REFUNDED_DATA,
  },
  {
    ...event(
      'core.ebarimt.receipt_issued',
      'Receipt issued',
      null,
      'An eBarimt receipt is issued for a paid invoice, or replaces one',
    ),
    ...RECEIPT_DATA,
  },
  {
    ...event(
      'core.broadcast.suppressed',
      'Address suppressed',
      'customer',
      'An email or phone stops getting broadcasts: unsubscribed, bounced or added by hand',
    ),
    ...SUPPRESSION_DATA,
  },
  {
    ...event(
      'core.automation.failed',
      'Automation failed',
      null,
      'A run of another automation fails at a step',
    ),
    ...AUTOMATION_FAILED_DATA,
  },
  {
    ...event(
      'core.integration.trigger_failed',
      'App trigger stopped',
      null,
      'A connected app stops sending events: its webhook or polling keeps failing',
    ),
    ...APP_TRIGGER_FAILED_DATA,
  },
  {
    ...event(
      'core.integration.changed',
      'App connection changed',
      null,
      'A connection is added, its keys or sign-in change, or it is turned off or removed (`change`): plugins that use it read it again',
    ),
    ...INTEGRATION_CHANGED_DATA,
  },
] satisfies readonly CoreEventType[];
