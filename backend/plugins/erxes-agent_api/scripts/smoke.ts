// Fast parallel smoke test — runs the independent core-path checks CONCURRENTLY
// against the real model + gateway, then prints a compact pass/fail table.
//   ERXES_AGENT_MEMORY=enable tsx --env-file=../../../.env scripts/smoke.ts
//
// Scenarios are independent, so they run in parallel (Promise.all); the two-turn
// memory check runs its turns sequentially *within* its own scenario. Wall-clock
// ≈ the slowest single scenario, not the sum.
import { generateModels } from '~/connectionResolvers';
import { prepareChatTurn, runAgentTurn } from '@/agent/turn';
import { runWithAuth } from '~/mastra/requestContext';
import { extractCandidates } from '@/../mastra/learning/extractor';

const SUB = process.env.AGENT_CLI_SUBDOMAIN || 'localhost';
const AGENT = 'test';

type Check = { name: string; ok: boolean; detail: string; ms: number };

async function chat(
  models: Awaited<ReturnType<typeof generateModels>>,
  user: string,
  thread: string,
  message: string,
): Promise<string> {
  const prepared = await prepareChatTurn({
    models,
    subdomain: SUB,
    user: { _id: user, isOwner: true, username: 'smoke' } as never,
    agentId: AGENT,
    message,
    threadId: thread,
  });
  return runWithAuth(prepared.authCtx, () =>
    runAgentTurn({
      agent: prepared.agent,
      convo: prepared.convo,
      message,
      authCtx: prepared.authCtx,
      memory: prepared.memoryBinding,
    }),
  );
}

async function timed(name: string, fn: () => Promise<Omit<Check, 'name' | 'ms'>>): Promise<Check> {
  const t0 = Date.now();
  try {
    const r = await fn();
    return { name, ...r, ms: Date.now() - t0 };
  } catch (e: unknown) {
    const msg = (e as Error)?.message || String(e);
    return { name, ok: false, detail: `threw: ${msg}`, ms: Date.now() - t0 };
  }
}

async function main() {
  const models = await generateModels(SUB);
  const id = `${Date.now()}`;

  const checks = await Promise.all([
    timed('chat:tool-turn', async () => {
      const reply = await chat(models, `s-chat-${id}`, `chat-${id}`, 'List 2 customers.');
      return { ok: reply.trim().length > 0, detail: reply.slice(0, 80) };
    }),
    timed('memory:cross-thread-recall', async () => {
      const u = `s-mem-${id}`;
      await chat(models, u, `mw-${id}`, 'Remember: my project is Bluefin and it ships Friday.');
      const reply = await chat(models, u, `mr-${id}`, "What's my project name and ship day?");
      const ok = /bluefin/i.test(reply) && /friday/i.test(reply);
      return { ok, detail: reply.slice(0, 80) };
    }),
    timed('learning:pii-redaction', async () => {
      const cfg = await models.MastraAgent.findOne({ agentId: AGENT });
      const providers = await models.MastraProvider.find({ isEnabled: true });
      const transcript =
        'User: I am Batbold Dorj, batbold@acme.io, +976 9911 2233, acct ACME-558123.\n' +
        'Assistant: To move a deal, drag its card to the target stage.\n' +
        'User: That worked, thanks.';
      const cands = await extractCandidates(
        transcript,
        { provider: cfg!.provider, model: cfg!.model, providers: providers as never, authCtx: { subdomain: SUB } },
        'user confirmed fix',
      );
      const blob = JSON.stringify(cands).toLowerCase();
      const leak = ['batbold', 'acme.io', '9911 2233', 'acme-558123'].find((p) => blob.includes(p));
      return { ok: !leak, detail: leak ? `LEAKED ${leak}` : `${cands.length} candidate(s), clean` };
    }),
  ]);

  console.log('\n  smoke results (agent: %s)\n', AGENT);
  for (const c of checks) {
    console.log(`  ${c.ok ? '✔' : '✗'}  ${c.name.padEnd(28)} ${String(c.ms + 'ms').padEnd(8)} ${c.detail}`);
  }
  const failed = checks.filter((c) => !c.ok);
  console.log(`\n  ${checks.length - failed.length}/${checks.length} passed\n`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error('FATAL:', e?.stack || e?.message || e);
  process.exit(1);
});
