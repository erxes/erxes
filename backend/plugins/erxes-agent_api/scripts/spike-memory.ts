// SPIKE — does Mastra Memory work with our infra?
//   MongoDBStore (storage) + QdrantVector (vector) + fastembed (embedder)
//   + ToolCallFilter, then a cross-thread semantic-recall check.
// Run: tsx --env-file=../../../.env scripts/spike-memory.ts --agent test
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { MongoDBStore } from '@mastra/mongodb';
import { QdrantVector } from '@mastra/qdrant';
import { ToolCallFilter } from '@mastra/core/processors';
import { generateModels } from '~/connectionResolvers';
import { buildModel, type ProviderDocLike } from '~/mastra/providers';
import { getEmbedder } from '~/mastra/memory/embedder';

const log = (...a: unknown[]) => console.log(...a);

async function main() {
  const agentId = process.argv.includes('--agent')
    ? process.argv[process.argv.indexOf('--agent') + 1]
    : 'test';
  const sub = process.env.AGENT_CLI_SUBDOMAIN || 'localhost';
  const models = await generateModels(sub);
  const a = (await models.MastraAgent.findOne({ agentId }).lean()) as any;
  const providers = (await models.MastraProvider.find({
    isEnabled: true,
  }).lean()) as ProviderDocLike[];

  const MONGO_URL = process.env.MONGO_URL as string;
  const QDRANT_URL =
    process.env.ERXES_AGENT_QDRANT_URL || 'http://localhost:6333';

  // 1) fastembed → MastraEmbeddingModel (AI SDK v2 embedding model adapter)
  const fe = await getEmbedder();
  log(`embedder: fastembed dim=${fe.dimension}`);
  const embedder = {
    specificationVersion: 'v2',
    provider: 'fastembed',
    modelId: 'bge-small-en-v1.5',
    maxEmbeddingsPerCall: 256,
    supportsParallelCalls: false,
    async doEmbed({ values }: { values: string[] }) {
      const embeddings = await fe.embed(values);
      return { embeddings };
    },
  } as any;

  // 2) storage + vector + memory
  const storage = new MongoDBStore({
    id: 'erxes-mem',
    url: MONGO_URL,
    dbName: 'mastra_spike',
  } as any);
  const vector = new QdrantVector({ id: 'erxes-mem-spike', url: QDRANT_URL });
  const memory = new Memory({
    storage,
    vector,
    embedder,
    options: {
      lastMessages: 10,
      semanticRecall: { topK: 3, messageRange: 2, scope: 'resource' },
      workingMemory: { enabled: false },
    },
  } as any);
  log('memory constructed ✔');

  // ToolCallFilter now lives on the Agent's inputProcessors (Memory.processors
  // is removed in @mastra/memory 1.20.3).
  const agent = new Agent({
    id: 'spike-mem',
    name: 'spike-mem',
    instructions:
      'You are a concise assistant. Use any remembered context to answer.',
    model: buildModel(a.provider, a.model, providers),
    memory: memory as any,
    inputProcessors: [new ToolCallFilter()],
  } as any);

  const resource = `spike-resource-${sub}`;
  const t1 = `spike-t1-${Date.now()}`;
  const t2 = `spike-t2-${Date.now()}`;

  log(`\n--- turn 1 (thread ${t1}) writes a fact ---`);
  const r1 = await agent.generate(
    'Please remember: my project is called Bluefin and it ships next Friday.',
    { memory: { thread: t1, resource }, modelSettings: { temperature: 1 } } as any,
  );
  log('reply1:', (r1.text || '').slice(0, 120));

  log(`\n--- turn 2 (NEW thread ${t2}, same resource) should recall ---`);
  const r2 = await agent.generate(
    'What is my project called and when does it ship? Answer in one sentence.',
    { memory: { thread: t2, resource }, modelSettings: { temperature: 1 } } as any,
  );
  const text = r2.text || '';
  log('reply2:', text.slice(0, 200));

  const recalled = /bluefin/i.test(text) && /friday/i.test(text);
  log(`\nRECALL ${recalled ? 'WORKED ✔' : 'did NOT surface the fact ✗'}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\nFAIL:', e?.stack || e?.message || e);
    process.exit(1);
  });
