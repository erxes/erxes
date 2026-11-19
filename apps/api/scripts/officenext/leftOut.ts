/**
 * Every source collection no import step reads, with the reason it stays out: the plugin that
 * owns it (`plugin:<name>`), a plugin outside this migration, or data with no new place. The
 * rules are tried in order and the first match wins; a name no rule knows is listed as such.
 */
import { inOrder } from '~/lib/sequence';
import type { Run } from './run';

const CARDS = 'old cards (deals, tasks, tickets): plugin:sales, plugin:operation, plugin:frontline';
const SKIPPED_SERVER = new Set(['admin', 'config', 'local']);

/** [old name pattern, reason], in the order they are tried. */
const RULES: [RegExp, string][] = [
  [/^(product_groups|posclient_|pos$|pos_|pos_orders)/, 'POS: plugin:sales'],
  [/^products_configs$/, 'UOM and similarity settings; core products have no such settings'],
  [/^properties_system_field/, 'system field settings: core has its own built-in fields'],
  [/^(sales_|deals?$|deal_|purchases|growth_?hacks?|growthhack)/, 'plugin:sales'],
  [/^(tasks?_|tasks$|taskss$|operation_)/, 'plugin:operation'],
  [
    /^(boards|pipelines|stages|pipeline_labels|pipeline_templates|checklists|checklist_items)$/,
    CARDS,
  ],
  [/^(tickets?_|tickets$|frontline_)/, 'plugin:frontline'],
  [
    /^(conversation|integrations|channel|forms$|form_|messenger_apps|response_templates|knowledgebase_|visitors$|scripts$)/,
    'inbox, forms and knowledge base: plugin:frontline',
  ],
  [
    /(facebook|instagram|whatsapp|telegram|viber|zalo|discord|callpro|nylas|smooch|gmail|twitter|telnyx|chatfuel|productboard)/,
    'channel integrations: plugin:frontline (members connect channels again)',
  ],
  [
    /^(calls_|call_records|cloudflare_calls|imap_|mail_|dailyco|comment|posts_|events$|schedule_pages)/,
    'channel integrations: plugin:frontline (members connect channels again)',
  ],
  [
    /^configs$/,
    'service settings and credentials (members enter them again); currency already MNT; core has no time zone setting',
  ],
  [
    /^(email_templates|automation_email_templates)$/,
    'email templates: core has no template library (broadcasts and automations keep their own body)',
  ],
  [/^email_deliveries$/, 'delivery log of sent emails: core logs its own sends'],
  [/^email_senders$/, 'sender addresses with provider credentials: members set up email again'],
  [
    /^(notification_configurations|notification_configs|notification_settings|user_notification_settings)$/,
    "per-type notification switches: core's notification groups are different; members set them again",
  ],
  [/^webhooks$/, 'webhooks: core needs a new signing secret, so members add them again'],
  [
    /^(apps|clients|app_tokens)$/,
    'API apps and clients with their secrets: made again as API keys',
  ],
  [/^emojis$/, 'reactions on employee feed and knowledge base posts: no plugin in this migration'],
  [
    /^(files_folders|file_shares|files_usages|filemanager_folders|filemanager_logs)$/,
    'file folders, shares and logs: core files have no folders',
  ],
  [/^(cms_|webbuilder_|web_|web_builders|content_cms)/, 'plugin:content (not in this migration)'],
  [
    /^(timeclock|bichil_|positions|user_movements|job_|skills?$|skill_types|works$|performs$)/,
    'plugin:hr (not in this migration)',
  ],
  [
    /^(mastra_|agents?_|automations_ai|automations_knowledge|automations_memories|ai_|assistant_orgs|hermes_|opencode_|erxes_agent)/,
    'plugin:agent (not in this migration)',
  ],
  [/^(chats?$|chat_|chat-)/, 'team chat: no plugin in the new stack'],
  [/^(block_)/, 'real estate (block): no plugin in the new stack'],
  [/^(bm_|ota_)/, 'tours (bm, ota): no plugin in the new stack'],
  [/^(pms_)/, 'plugin:pms (not in this migration)'],
  [/^(loan_)/, 'loans: no plugin in the new stack'],
  [/^(exm|forum_|communication_)/, 'employee and community feeds: no plugin in this migration'],
  [
    /^(accounting|accounts$|account_categories|adjust_|safe_remainder|inventories_|fxa_|fixed_asset|asset|syncerkhet)/,
    'accounting and inventory: no plugin in this migration',
  ],
  [
    /^(loyalty|voucher|spin|lotter|donate|assignment|score_logs|sales_loyalty)/,
    'loyalty: no plugin in this migration',
  ],
  [/^(risk_)/, 'risk assessment: no plugin in the new stack'],
  [/^(event_)/, 'events: no plugin in the new stack'],
  [
    /^(calendar|goals$|neighbor_|cars?$|car_categories|robot_entries)/,
    'no plugin in the new stack',
  ],
  [
    /^(ecommerce_|product_rules|product_similarities|product_conditions|product_packages|product_templates|pricings|bundle_)/,
    'pricing and e-commerce: no plugin in this migration',
  ],
  [/^(documents|templates|template_|flows$|processes|approval_)/, 'no plugin in this migration'],
  [
    /^(dashboard|insight_charts|reports$|frontline_report)/,
    'reports and dashboards: rebuilt in the new reports',
  ],
  [
    /^(export_histories|exports$|import_histories|imports$|onboarding_histories|migrations$|installation_logs)/,
    'old job history: nothing to run again',
  ],
  [
    /^(oauth_|app_tokens|auth_|credential|ldap_|org_white_labels|cf_os_connect)/,
    'credentials and tokens: members sign in and connect again',
  ],
  [/^(exchange_rates|currency_rates)$/, 'exchange rates: core has none'],
  [/^(user_activity_dailies)$/, 'daily activity counts: core counts its own'],
];

/** Databases read the same way as `erxes`, and those owned whole. */
const DATABASES: Record<string, string | null> = {
  erxes: null,
  erxes_office: null,
  erxes_logs: null,
  erxes_office_engages: null,
  erxes_office_integrations: 'old integrations copy: plugin:frontline (members connect again)',
  erxes_integrations: 'old integrations copy: plugin:frontline (members connect again)',
  erxes_client_portal: 'old client portal service: its users are in erxes.client_portal_users',
  erxes_agents_memory: 'plugin:agent (not in this migration)',
  erxes_mastra_memory: 'plugin:agent (not in this migration)',
  erxes_mastra_runtime_os: 'plugin:agent (not in this migration)',
  erxes_mastra_scheduler: 'plugin:agent (not in this migration)',
  undefined_logs: 'logs a misconfigured service wrote: no organisation to give them to',
};

/** Why `name` (in database `db`) stays out. */
export const reasonOf = (db: string, name: string) =>
  DATABASES[db] ??
  RULES.find(([pattern]) => pattern.test(name))?.[1] ??
  'no core table or plugin known for it';

/** Lists every collection on the server that no step covered. `covered` holds `db.name`s. */
export const reportLeftOut = async (run: Run, covered: Set<string>) => {
  const { databases } = await run.mongo.admin().listDatabases({ nameOnly: true });

  const names = databases.map((each) => each.name).filter((name) => !SKIPPED_SERVER.has(name));

  await inOrder(names, async (dbName) => {
    const db = run.other(dbName);
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();

    await inOrder(
      collections.filter((each) => !covered.has(`${dbName}.${each.name}`)),
      async (each) => {
        const documents = await db.collection(each.name).estimatedDocumentCount();
        const label = dbName === 'erxes' ? each.name : `${dbName}.${each.name}`;

        run.report.leftOut(
          label,
          '(left out)',
          documents,
          documents ? reasonOf(dbName, each.name) : 'empty',
        );
      },
    );
  });
};
