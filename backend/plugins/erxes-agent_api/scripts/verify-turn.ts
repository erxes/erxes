// Minimal Phase-1 verifier — runs a real chat turn through main's pipeline
// (prepareChatTurn -> runAgentTurn) to confirm native generate() works for a
// provider (esp. kimi-for-coding). Run:
//   tsx --env-file=../../../.env scripts/verify-turn.ts --agent test -m "list 3 customers"
import { generateModels } from '~/connectionResolvers';
import { prepareChatTurn, runAgentTurn } from '@/agent/turn';
import { runWithAuth } from '~/mastra/requestContext';

function arg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : def;
}

async function main() {
  const sub = process.env.AGENT_CLI_SUBDOMAIN || 'localhost';
  const agentId = arg('--agent', 'test') as string;
  const message = (arg('-m') || arg('--message') || 'hi') as string;
  const models = await generateModels(sub);
  const user = { _id: 'cli-tester', isOwner: true, username: 'cli' } as any;

  const t0 = Date.now();
  console.log(`\n▶ ${agentId}  "${message}"\n`);
  const prepared = await prepareChatTurn({
    models,
    subdomain: sub,
    user,
    agentId,
    message,
    threadId: `verify-${Date.now()}`,
  });
  console.log(
    `agent=${prepared.agentConfig.provider}/${prepared.agentConfig.model} tools=${Object.keys(prepared.tools).length}`,
  );
  const reply = await runWithAuth(prepared.authCtx, () =>
    runAgentTurn({
      agent: prepared.agent,
      convo: prepared.convo,
      message,
      authCtx: prepared.authCtx,
    }),
  );
  console.log(`\n▌ ${reply}\n— ${Date.now() - t0}ms`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\nFAIL:', e?.stack || e?.message || e);
    process.exit(1);
  });
