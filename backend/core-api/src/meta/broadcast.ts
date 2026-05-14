import { startBroadcastWorker } from '@/broadcast/worker';
import { Express } from 'express';

export const initBroadcast = async (app: Express) => startBroadcastWorker(app);
