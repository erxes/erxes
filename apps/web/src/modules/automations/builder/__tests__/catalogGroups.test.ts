import {
  IconBolt,
  IconBrandFacebook,
  IconBuilding,
  IconChecklist,
  IconCreditCard,
  IconForms,
  IconMagnet,
  IconMail,
  IconMessage,
  IconNote,
  IconPlugConnected,
  IconPuzzle,
  IconUser,
  IconWebhook,
} from '@tabler/icons-react';
import { describe, expect, it } from 'vite-plus/test';
import { type CatalogItem, catalogIcon, groupItems, groupOf, matchWords } from '../catalogGroups';

const core = (type: string): CatalogItem => ({ type, label: type, source: 'core' });

const plugin = (source: string, type: string): CatalogItem => ({ type, label: type, source });

const invoice: CatalogItem = {
  type: 'test.invoice.create',
  label: 'Create an invoice',
  source: 'core',
  integration: 'test',
  integrationName: 'Test',
};

describe('the automation catalog’s groups', () => {
  it('puts core’s items in their area, in a fixed order, and the rest under General', () => {
    const areas = [
      ['core.customer.created', 'customers', 'Customers', IconUser, 0],
      ['core.lead.stage_changed', 'leads', 'Leads', IconMagnet, 1],
      ['core.company.update', 'companies', 'Companies', IconBuilding, 2],
      ['core.payment.paid', 'payments', 'Payments', IconCreditCard, 3],
      ['core.email.send', 'messages', 'Messages', IconMail, 4],
      ['core.notification.send', 'messages', 'Messages', IconMail, 4],
      ['core.note.add', 'timeline', 'Timeline', IconNote, 5],
      ['core.webhook.post', 'integrations', 'Integrations', IconWebhook, 6],
      ['core.http.request', 'integrations', 'Integrations', IconWebhook, 6],
    ] as const;

    for (const [type, area, label, icon, order] of areas)
      expect(groupOf(core(type))).toEqual({
        key: `core:${area}`,
        source: 'core',
        label,
        icon,
        order,
      });

    const general = {
      key: 'core:general',
      source: 'core',
      label: 'General',
      icon: IconBolt,
      order: 50,
    };

    expect(groupOf(core('core.segment.matched'))).toEqual(general);
    expect(groupOf(core('core'))).toEqual(general);
  });

  it('groups a plugin’s items under the plugin, and an integration’s under the integration', () => {
    expect(groupOf(plugin('hr', 'hr.leave.approved'))).toEqual({
      key: 'plugin:hr',
      source: 'hr',
      label: 'HR',
      icon: IconPuzzle,
      order: 100,
    });
    expect(groupOf({ ...plugin('sales', 'sales.deal.won'), integration: null }).label).toBe(
      'Sales',
    );
    expect(groupOf(invoice)).toMatchObject({
      key: 'integration:test',
      source: 'core',
      label: 'Test',
      logo: false,
      order: 60,
    });
    expect(groupOf(invoice).icon).not.toBe(IconPlugConnected);
    expect(
      groupOf({ ...invoice, type: 'stripe.create_customer', integration: 'stripe' }),
    ).toMatchObject({ key: 'integration:stripe', logo: true });
    expect(
      groupOf({
        ...plugin('frontline', 'frontline.facebook.reply'),
        integration: 'frontline.facebook',
        integrationName: null,
      }),
    ).toEqual({
      key: 'integration:frontline.facebook',
      source: 'frontline',
      label: 'frontline.facebook',
      icon: IconPlugConnected,
      order: 60,
    });
  });

  it('lists core’s areas first, then integrations, then plugins, each by name', () => {
    const qpay: CatalogItem = {
      ...invoice,
      type: 'qpay.invoice.create',
      integration: 'qpay',
      integrationName: 'QPay',
    };

    const grouped = groupItems([
      plugin('sales', 'sales.deal.won'),
      core('core.notification.send'),
      invoice,
      plugin('hr', 'hr.leave.approved'),
      core('core.segment.matched'),
      qpay,
      core('core.customer.update'),
      core('core.email.send'),
    ]);

    expect(grouped.map(({ group, items }) => [group.key, items.map((item) => item.type)])).toEqual([
      ['core:customers', ['core.customer.update']],
      ['core:messages', ['core.notification.send', 'core.email.send']],
      ['core:general', ['core.segment.matched']],
      ['integration:qpay', ['qpay.invoice.create']],
      ['integration:test', ['test.invoice.create']],
      ['plugin:hr', ['hr.leave.approved']],
      ['plugin:sales', ['sales.deal.won']],
    ]);
  });

  it('shows a plugin item by the first word of its type with an icon, else by its group', () => {
    expect(catalogIcon(plugin('frontline', 'frontline.facebook.message_received'))).toBe(
      IconBrandFacebook,
    );
    expect(catalogIcon(plugin('frontline', 'frontline.conversation.created'))).toBe(IconMessage);
    expect(catalogIcon(plugin('sales', 'sales.deal.form_submitted'))).toBe(IconForms);
    expect(catalogIcon(plugin('tasks', 'tasks.task.created'))).toBe(IconChecklist);
    expect(catalogIcon(plugin('telegram', 'telegram.message.received'))).toBe(IconMessage);
    expect(catalogIcon(plugin('hr', 'hr.leave.approved'))).toBe(IconPuzzle);
    expect(catalogIcon(core('core.lead.form_submitted'))).toBe(IconMagnet);
    expect(catalogIcon(invoice)).toBe(groupOf(invoice).icon);
  });

  it('finds an item when every word searched is in its name or keywords', () => {
    expect(matchWords('Send an email', 'email SEND')).toBe(1);
    expect(matchWords('Send an email', 'send   em')).toBe(1);
    expect(matchWords('Send an email', 'send sms')).toBe(0);
    expect(matchWords('Send an email', '')).toBe(1);
    expect(matchWords('Create an invoice', 'qpay invoice', ['QPay', 'Payments'])).toBe(1);
    expect(matchWords('Create an invoice', 'qpay')).toBe(0);
    expect(matchWords('Create an invoice', 'invoiceqpay', ['QPay'])).toBe(0);
  });
});
