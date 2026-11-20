import { META_EVENTS, type MetaKind } from '@erxes/core-contract';
import { automations, automationVersions, type Db } from '@erxes/core-db';
import { AutomationDefinition, type AutomationStep } from '@erxes/core-db/automationDefinition';
import { and, eq, like, or, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { recordAudit } from '~/modules/audit/audit.service';
import { triggerKey } from '~/modules/automations/triggers';
import { META_REPLIES } from './actions';

type Thread = 'message' | 'comment';

type Source = { event: string; kind: MetaKind; thread: Thread };

type Move = {
  sources: Map<string, Source>;
  replies: Map<string, MetaKind>;
  trigger: Source | undefined;
  moved: Map<string, Thread>;
  left: number;
};

const sourcesOf = (plugin: string) =>
  new Map<string, Source>([
    [
      `${plugin}.facebook.message_received`,
      { event: META_EVENTS.messenger.received, kind: 'facebook', thread: 'message' },
    ],
    [
      `${plugin}.instagram.message_received`,
      { event: META_EVENTS.instagram.received, kind: 'instagram', thread: 'message' },
    ],
    [
      `${plugin}.facebook.comment_received`,
      { event: META_EVENTS.facebook.comment, kind: 'facebook', thread: 'comment' },
    ],
    [
      `${plugin}.instagram.comment_received`,
      { event: META_EVENTS.instagram.comment, kind: 'instagram', thread: 'comment' },
    ],
  ]);

const repliesOf = (plugin: string) =>
  new Map<string, MetaKind>([
    [`${plugin}.facebook.reply`, 'facebook'],
    [`${plugin}.instagram.reply`, 'instagram'],
  ]);

const moveAction = (step: Extract<AutomationStep, { type: 'action' }>, move: Move) => {
  const kind = move.replies.get(step.action);

  if (!kind) return step;

  if (move.trigger?.kind !== kind) {
    move.left += 1;

    return step;
  }

  const { message, ...input } = step.input;

  move.moved.set(step.id, move.trigger.thread);

  return {
    ...step,
    action: META_REPLIES[kind][move.trigger.thread],
    input: message === undefined ? input : { ...input, text: message },
  };
};

const moveSteps = (steps: AutomationStep[], move: Move): AutomationStep[] =>
  steps.map((step): AutomationStep => {
    switch (step.type) {
      case 'action':
        return moveAction(step, move);
      case 'wait_for':
        return { ...step, event: move.sources.get(step.event)?.event ?? step.event };
      case 'branch':
        return { ...step, then: moveSteps(step.then, move), else: moveSteps(step.else, move) };
      case 'switch':
        return {
          ...step,
          cases: step.cases.map((item) => ({ ...item, steps: moveSteps(item.steps, move) })),
          otherwise: moveSteps(step.otherwise, move),
        };
      case 'split':
        return {
          ...step,
          paths: step.paths.map((path) => ({ ...path, steps: moveSteps(path.steps, move) })),
        };
      default:
        return step;
    }
  });

const count = (text: string, pattern: RegExp) => text.match(pattern)?.length ?? 0;

const rewriteText = (text: string, moved: Map<string, Thread>) => {
  const ids = [...moved.keys()];
  const comments = ids.filter((id) => moved.get(id) === 'comment');

  const rewritten = [
    ...comments.map(
      (id) =>
        [
          new RegExp(`\\bsteps\\.${id}\\.output\\.messageId\\b`, 'g'),
          `steps.${id}.output.commentId`,
        ] as const,
    ),
    [/\bevent\.payload\.content\b/g, 'event.payload.text'] as const,
  ].reduce((current, [pattern, to]) => current.replace(pattern, to), text);

  const left =
    count(rewritten, /\bevent\.payload\.(conversationId|integrationId)\b/g) +
    (ids.length
      ? count(
          rewritten,
          new RegExp(`\\bsteps\\.(${ids.join('|')})\\.output\\.(conversationId|content)\\b`, 'g'),
        )
      : 0);

  return { rewritten, left };
};

const moveDefinition = (definition: AutomationDefinition, plugin: string) => {
  const sources = sourcesOf(plugin);

  const trigger =
    definition.trigger.kind === 'event' ? sources.get(definition.trigger.event) : undefined;

  const move: Move = { sources, replies: repliesOf(plugin), trigger, moved: new Map(), left: 0 };

  const steps = moveSteps(definition.steps, move);

  const next =
    definition.trigger.kind === 'event' && trigger
      ? { ...definition, trigger: { ...definition.trigger, event: trigger.event }, steps }
      : { ...definition, steps };

  const before = JSON.stringify(definition);
  const { rewritten, left } = rewriteText(JSON.stringify(next), move.moved);

  return {
    definition: AutomationDefinition.parse(JSON.parse(rewritten)),
    changed: rewritten !== before,
    placeholdersLeft: left,
    stepsLeft: move.left,
  };
};

const activeDefinition = async (client: Db, id: string, version: number) => {
  const [row] = await client
    .select({ definition: automationVersions.definition })
    .from(automationVersions)
    .where(and(eq(automationVersions.automationId, id), eq(automationVersions.version, version)))
    .limit(1);

  return row?.definition;
};

const publishMoved = async (client: Db, row: typeof automations.$inferSelect, plugin: string) => {
  const published = row.activeVersion
    ? await activeDefinition(client, row.id, row.activeVersion)
    : undefined;

  const moved = published && moveDefinition(published, plugin);

  if (!row.activeVersion || !moved?.changed) return row.activeVersion;

  const version = row.activeVersion + 1;

  await client
    .insert(automationVersions)
    .values({ automationId: row.id, version, definition: moved.definition, publishedBy: null });

  return version;
};

export const moveAutomations = async (client: Db, plugin: string) => {
  const rows = await client
    .select()
    .from(automations)
    .where(
      or(
        like(sql`${automations.definition}::text`, `%"${plugin}.facebook.%`),
        like(sql`${automations.definition}::text`, `%"${plugin}.instagram.%`),
      ),
    );

  const totals = { automations: 0, placeholdersLeft: 0, stepsLeft: 0 };

  await inOrder(rows, async (row) => {
    const moved = moveDefinition(row.definition, plugin);

    totals.placeholdersLeft += moved.placeholdersLeft;
    totals.stepsLeft += moved.stepsLeft;

    if (!moved.changed) return;

    const activeVersion = await publishMoved(client, row, plugin);

    await client
      .update(automations)
      .set({
        definition: moved.definition,
        triggerEvent: triggerKey(moved.definition),
        activeVersion,
        updatedAt: sql`now()`,
      })
      .where(eq(automations.id, row.id));
    await recordAudit(client, {
      action: 'automation.updated',
      targetType: 'automation',
      targetId: row.id,
      targetLabel: row.name,
      metadata: { movedToCoreMeta: true, publishedVersion: activeVersion },
    });

    totals.automations += 1;
  });

  return totals;
};
