import { Job } from 'bullmq';
import { heartbeatRun } from './drain';
import { handleEmailProcessor } from './email';
import { handleMessengerProcessor } from './messenger';
import { handleNotificationProcessor } from './notification';
import { reconcileSchedules } from './reconcile';
import { fireSchedule, ISchedulePayload } from './schedule';
import { handleWorkflowProcessor } from './workflow';

type BroadcastMethod = 'email' | 'messenger' | 'notification' | 'workflow';

interface BroadcastDrainPayload {
  subdomain: string;
  runId: string;
  campaignTitle?: string;
  kind?: 'drain' | 'heartbeat';
  beat?: number;
}

interface BroadcastReconcilePayload {
  subdomain: string;
  kind: 'reconcile';
}

interface BroadcastJobData {
  method: BroadcastMethod;
  // An alarm addresses a campaign, a drain addresses a run: `kind` is what
  // tells them apart before either is read.
  payload: BroadcastDrainPayload | ISchedulePayload | BroadcastReconcilePayload;
}

const PROCESS_HANDLERS: Record<
  BroadcastMethod,
  (payload: unknown) => Promise<void>
> = {
  email: handleEmailProcessor,
  messenger: handleMessengerProcessor,
  notification: handleNotificationProcessor,
  workflow: handleWorkflowProcessor,
};

export const broadcastProcessor = async (job: Job<BroadcastJobData>) => {
  const { method, payload } = job.data;

  // An alarm going off, which opens the run the method lanes then drain.
  if (payload?.kind === 'start') {
    return await fireSchedule(payload);
  }

  // The sweep that puts back alarms the queue has lost.
  if (payload?.kind === 'reconcile') {
    await reconcileSchedules(payload.subdomain);
    return;
  }

  // A heartbeat belongs to no method: it only asks whether the run still needs
  // draining, and leaves the sending to whichever lane owns it.
  if (payload?.kind === 'heartbeat') {
    return await heartbeatRun(payload);
  }

  const handleProcess = PROCESS_HANDLERS[method];

  if (!handleProcess) {
    throw new Error(`BroadcastProcessor: Unknown method "${method}"`);
  }

  // Each drain owns what happens to its own run, including marking it failed,
  // because only it knows which run the job addressed.
  return await handleProcess(payload);
};
