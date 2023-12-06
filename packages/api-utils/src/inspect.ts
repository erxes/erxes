import * as dotenv from 'dotenv';
dotenv.config();
import { promisify } from 'util';

// TODO: replace it with "node:inspector/promises" after migrating to Node version >= 20
import { HeapProfiler, Profiler, Session } from 'node:inspector';
import { Express } from 'express';
const session = new Session() as any;
session.connect();

const post = promisify(session.post.bind(session));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const { NODE_INSPECTOR } = process.env;

const nodeInspector = NODE_INSPECTOR === 'enabled';

export async function cpuPreciseCoverage(
  seconds = 10
): Promise<Profiler.ScriptCoverage[]> {
  // session.connect();
  await post('Profiler.enable');

  await post('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true
  });

  await sleep(seconds * 1000);

  const { result } = await post('Profiler.takePreciseCoverage');

  await post('Profiler.stopPreciseCoverage');
  await post('Profiler.disable');
  // session.disconnect();
  return result;
}

export async function cpuProfile(seconds = 10): Promise<Profiler.Profile> {
  // session.connect();
  await post('Profiler.enable');
  await post('Profiler.start');

  await sleep(seconds * 1000);

  const { profile } = await post('Profiler.stop');

  await post('Profiler.disable');
  // session.disconnect();
  return profile;
}

export async function heapProfile(
  seconds = 10
): Promise<HeapProfiler.SamplingHeapProfile> {
  // session.connect();
  await post('HeapProfiler.enable');
  await post('HeapProfiler.startSampling');

  await sleep(seconds * 1000);

  const { profile } = await post('HeapProfiler.stopSampling');

  await post('HeapProfiler.disable');
  // session.disconnect();
  return profile;
}

export async function heapSnapshot(
  chunkCb: (chunk: string) => void
): Promise<void> {
  return new Promise<void>(async resolve => {
    // session.connect();
    const getChunk = m => {
      chunkCb(m.params.chunk);
    };
    session.on('HeapProfiler.addHeapSnapshotChunk', getChunk);

    await post('HeapProfiler.takeHeapSnapshot');

    session.removeListener('HeapProfiler.addHeapSnapshotChunk', getChunk);
    // session.disconnect();
    return resolve();
  });
}

export function applyInspectorEndpoints(app: Express, name: string) {
  app.use('/node-inspector', (req, res, next) => {
    if (nodeInspector) {
      return next();
    }
    return res.status(403).send('Node inspector is not enabled');
  });

  app.get('/node-inspector/precise-coverage/:seconds', async (req, res) => {
    try {
      const seconds = Number(req.params.seconds) || 10;

      const coverage = await cpuPreciseCoverage(seconds);

      res.header('Content-Type', 'application/json');
      return res.send(JSON.stringify(coverage, null, 4));
    } catch (e) {
      return res.status(500).send(e.message);
    }
  });

  app.get('/node-inspector/cpu-profile/:seconds', async (req, res) => {
    try {
      const seconds = Number(req.params.seconds) || 10;

      const profile = await cpuProfile(seconds);

      res.attachment(`${name}-cpu-profile-${Date.now()}.cpuprofile`);
      res.type('application/json');
      return res.send(JSON.stringify(profile));
    } catch (e) {
      return res.status(500).send(e.message);
    }
  });

  app.get('/node-inspector/heap-profile/:seconds', async (req, res) => {
    try {
      const seconds = Number(req.params.seconds) || 10;

      const profile = await heapProfile(seconds);

      res.attachment(`${name}-heap-profile-${Date.now()}.heapprofile`);
      res.type('application/json');
      return res.send(JSON.stringify(profile));
    } catch (e) {
      return res.status(500).send(e.message);
    }
  });

  app.get('/node-inspector/heap-snapshot/', async (req, res) => {
    try {
      res.attachment(`${name}-heap-snapshot-${Date.now()}.heapsnapshot`);
      res.type('json');
      await heapSnapshot(chunk => res.write(chunk));
      res.end();
    } catch (e) {
      return res.status(500).send(e.message);
    }
  });
}
