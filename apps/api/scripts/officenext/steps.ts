/**
 * The import's steps in order. Each names the source collections it reads, so `--only` can
 * pick it, and the inventory step can tell which collections are covered. A name without a
 * database (`users`) is in `erxes`; others name theirs (`erxes_logs.logs`).
 */
import { importActivityLogs } from './activityLogs';
import { importAuditLogs } from './auditLogs';
import { importBroadcastRecipients } from './broadcastRecipients';
import { importBroadcasts } from './broadcasts';
import { importClientPortalUsers } from './clientPortal';
import { importCompanies } from './companies';
import { importConformities, importRelations } from './conformities';
import { importCustomers } from './customers';
import { importFavorites } from './favorites';
import { importFields } from './fields';
import { importFieldValues } from './fieldValues';
import { importGateways } from './gateways';
import { importInvoices } from './invoices';
import { reportLeftOut } from './leftOut';
import { importNotes, importPluginNotes } from './notes';
import { importNotifications } from './notifications';
import { importPluginActivities } from './pluginActivities';
import { importProducts } from './products';
import { importReceipts } from './receipts';
import type { Run } from './run';
import { importSegments } from './segments';
import { v1Source } from './sources';
import { importStoredFiles } from './storedFiles';
import { importSuppressions } from './suppressions';
import { importTags } from './tags';
import { importUnits } from './units';
import { importUsers } from './users';
import { importWebhooks } from './webhooks';

export interface Step {
  name: string;
  collections: string[];
  run: (run: Run) => Promise<void>;
}

export const STEPS: Step[] = [
  {
    name: 'team',
    collections: [
      'users',
      'roles',
      'permissions',
      'user_groups',
      'branches',
      'departments',
      'units',
      'structures',
    ],
    run: async (run) => {
      const users = await importUsers(run);

      await importUnits(run, users);
    },
  },
  { name: 'tags', collections: ['tags', 'brands'], run: importTags },
  {
    name: 'customers',
    collections: ['customers', 'erxes_office.customers'],
    run: async (run) => {
      await importCustomers(run);
      await importCustomers(run, await v1Source(run, 'customers'));
    },
  },
  {
    name: 'companies',
    collections: ['companies', 'erxes_office.companies'],
    run: async (run) => {
      await importCompanies(run);
      await importCompanies(run, await v1Source(run, 'companies'));
    },
  },
  {
    name: 'conformities',
    collections: ['conformities', 'erxes_office.conformities'],
    run: async (run) => {
      await importConformities(run);
      await importConformities(run, await v1Source(run, 'conformities'));
    },
  },
  { name: 'relations', collections: ['relations'], run: importRelations },
  {
    name: 'notes',
    collections: ['internal_notes', 'erxes_office.internal_notes'],
    run: async (run) => {
      await importNotes(run);
      await importNotes(run, await v1Source(run, 'internal_notes'));
    },
  },
  {
    name: 'plugin notes',
    collections: ['operation_notes', 'frontline_tickets_notes'],
    run: importPluginNotes,
  },
  {
    name: 'plugin activity',
    collections: ['operation_activities', 'frontline_ticket_activities'],
    run: importPluginActivities,
  },
  {
    name: 'activity',
    collections: ['activity_logs', 'erxes_office.activity_logs'],
    run: async (run) => {
      await importActivityLogs(run);
      await importActivityLogs(run, await v1Source(run, 'activity_logs'));
    },
  },
  {
    name: 'audit',
    collections: ['logs', 'erxes_office.logs', 'erxes_logs.logs'],
    run: importAuditLogs,
  },
  {
    name: 'client portal users',
    collections: ['client_portal_users'],
    run: importClientPortalUsers,
  },
  {
    name: 'products',
    collections: ['products', 'product_categories', 'uoms'],
    run: importProducts,
  },
  {
    name: 'fields',
    collections: [
      'properties_groups',
      'fields_groups',
      'erxes_office.fields_groups',
      'properties_fields',
      'fields',
      'erxes_office.fields',
    ],
    run: importFields,
  },
  { name: 'field values', collections: ['field values'], run: importFieldValues },
  { name: 'segments', collections: ['segments'], run: importSegments },
  { name: 'notifications', collections: ['notifications'], run: importNotifications },
  {
    name: 'broadcasts',
    collections: [
      'broadcast_engage_messages',
      'engage_messages',
      'erxes_office_engages.engage_messages',
      'broadcast_recipients',
      'broadcast_delivery_reports',
      'erxes_office_engages.delivery_reports',
    ],
    run: async (run) => {
      await importBroadcasts(run);
      await importBroadcastRecipients(run);
    },
  },
  { name: 'favorites', collections: ['favorites'], run: importFavorites },
  { name: 'suppressions', collections: ['email_addresses'], run: importSuppressions },
  {
    name: 'files',
    collections: ['files', 'file_versions', 'filemanager_files'],
    run: importStoredFiles,
  },
  {
    name: 'payments',
    collections: [
      'payment_methods',
      'payments',
      'golomt_bank_configs',
      'payment_configs',
      'payment_invoices',
      'invoices',
      'payment_transactions',
      'put_responses',
      'webhooks',
      'erxes_office.webhooks',
    ],
    run: async (run) => {
      await importGateways(run);
      await importInvoices(run);
      await importReceipts(run);
      await importWebhooks(run);
    },
  },
  {
    name: 'inventory',
    collections: [],
    run: (run) =>
      reportLeftOut(
        run,
        new Set(
          STEPS.flatMap((step) =>
            step.collections.map((name) => (name.includes('.') ? name : `erxes.${name}`)),
          ),
        ),
      ),
  },
];
