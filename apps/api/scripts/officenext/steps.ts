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
import { reportLeftOut } from './leftOut';
import { importNotes } from './notes';
import { importNotifications } from './notifications';
import { importProducts } from './products';
import type { Run } from './run';
import { importSegments } from './segments';
import { importStoredFiles } from './storedFiles';
import { importSuppressions } from './suppressions';
import { importTags } from './tags';
import { importUnits } from './units';
import { importUsers } from './users';

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
  { name: 'customers', collections: ['customers'], run: importCustomers },
  { name: 'companies', collections: ['companies'], run: importCompanies },
  { name: 'conformities', collections: ['conformities'], run: (run) => importConformities(run) },
  { name: 'relations', collections: ['relations'], run: importRelations },
  { name: 'notes', collections: ['internal_notes'], run: (run) => importNotes(run) },
  { name: 'activity', collections: ['activity_logs'], run: (run) => importActivityLogs(run) },
  { name: 'audit', collections: ['logs', 'erxes_logs.logs'], run: importAuditLogs },
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
    collections: ['properties_groups', 'fields_groups', 'properties_fields', 'fields'],
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
