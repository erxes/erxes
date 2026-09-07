import {
  segmentDependencyKey,
  SegmentReconcileEvent,
  sendSegmentRebuild,
  sendSegmentReconcile,
} from 'erxes-api-shared/core-modules';
import { getPlugins, sendTRPCMessage } from 'erxes-api-shared/utils';
import { segmentLog, segmentSkip } from './log';

const BATCH = Number(process.env.SEGMENT_RECONCILE_BATCH) || 50;

const MAX_STEPS = Number(process.env.SEGMENT_RECONCILE_STEPS) || 1000;

type DueSegment = {
  _id: string;
  contentType: string;
  membersCount?: number;
  dependsOn?: string[];
  timeSensitive?: boolean;
};

const pluginOf = (contentType: string) => contentType.split(':')[0];

const readable = (segment: DueSegment, enabled: Set<string>): boolean =>
  (segment.dependsOn || [])
    .filter((dependency) => !dependency.startsWith(segmentDependencyKey('')))
    .map(pluginOf)
    .every((plugin) => plugin === 'core' || enabled.has(plugin));

export const reconcileSegments = async ({
  subdomain,
  before,
  step = 0,
}: SegmentReconcileEvent) => {
  const startedAt = before || new Date().toISOString();

  const enabled = new Set(await getPlugins());
  const drifted: string[] = [];
  let checked = 0;
  let skipped = 0;

  const due: DueSegment[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'segmentsToReconcile',
    method: 'mutation',
    input: { limit: BATCH, before: startedAt },
    defaultValue: [],
  });

  if (due.length) {
    for (const segment of due) {
      if (!readable(segment, enabled)) {
        skipped++;
        continue;
      }

      if (segment.timeSensitive) {
        checked++;
        drifted.push(segment._id);
        sendSegmentRebuild({ subdomain, segmentId: segment._id });
        continue;
      }

      const { count }: { count: number } = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'segment',
        action: 'segmentCount',
        input: { segmentId: segment._id },
        defaultValue: { count: -1 },
      });

      if (count < 0) {
        skipped++;
        continue;
      }

      checked++;

      if (count !== segment.membersCount) {
        drifted.push(segment._id);
        sendSegmentRebuild({ subdomain, segmentId: segment._id });
      }
    }
  }

  segmentLog(`reconcile batch ${step + 1}`, {
    checked,
    rebuilt: drifted.length,
    ...(drifted.length ? { segments: drifted } : {}),
  });

  if (skipped) {
    segmentSkip(`${skipped} segment(s) were not readable this pass`);
  }

  if (due.length < BATCH) {
    return;
  }

  if (step + 1 >= MAX_STEPS) {
    segmentSkip(
      `reconcile stopped after ${MAX_STEPS} batches; the rest go first tomorrow`,
    );
    return;
  }

  sendSegmentReconcile({ subdomain, before: startedAt, step: step + 1 });
};
