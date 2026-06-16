/**
 * SPIKE — can an OpenAI-compatible provider (esp. kimi-for-coding) run through
 * Mastra's NATIVE generate() via the config-object model, instead of the
 * @ai-sdk/openai-compatible (v1) + generateLegacy() path?
 *
 *   ../../../node_modules/.bin/tsx --env-file=../../../.env scripts/spike-native-model.ts --agent test
 *   ... --provider kimi-for-coding --model kimi-for-coding
 */
import { Agent } from '@mastra/core/agent';
import { generateModels } from '~/connectionResolvers';
import { PROVIDER_PRESETS } from '~/mastra/providers';

const c = (code: string, s: string) =>
  process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s;
const green = (s: string) => c('32', s);
const red = (s: string) => c('31', s);
const dim = (s: string) => c('2', s);
const bold = (s: string) => c('1', s);

function parse(argv: string[]) {
  const a: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      a[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return a;
}

async function main() {
  const args = parse(process.argv.slice(2));
  const sub = args.subdomain || process.env.AGENT_CLI_SUBDOMAIN || 'localhost';
  const models = await generateModels(sub);

  let provider = args.provider;
  let model = args.model;
  if (args.agent) {
    const a = await models.MastraAgent.findOne({ agentId: args.agent }).lean();
    if (!a) throw new Error(`agent ${args.agent} not found`);
    provider = (a as any).provider;
    model = (a as any).model;
  }
  if (!provider || !model)
    throw new Error('need --agent <id> or --provider <p> --model <m>');

  const provDoc = (await models.MastraProvider.findOne({
    provider,
  }).lean()) as any;
  const preset = PROVIDER_PRESETS.find((p) => p.provider === provider);

  const envKey = provDoc?.envKey || preset?.envKey;
  const apiKey = provDoc?.apiKey || (envKey ? process.env[envKey] : undefined);
  const baseURL = provDoc?.baseUrl || preset?.baseUrl || undefined;
  const headers = {
    ...(preset?.headers || {}),
    ...(provDoc?.headers || {}),
  };
  const isCompat =
    preset?.isOpenAICompatible === true || provDoc?.isOpenAICompatible === true;

  console.log(bold(`\nSPIKE native generate() — ${provider}/${model}`));
  console.log(
    dim(
      `compat=${isCompat} baseURL=${baseURL || '(registry default)'} key=${apiKey ? 'set' : 'MISSING'} headers=${Object.keys(headers).join(',') || 'none'}\n`,
    ),
  );

  // Candidate model configs to try, in order.
  const candidates: { label: string; model: any }[] = [
    {
      label: `string "${provider}/${model}" (Mastra registry)`,
      model: `${provider}/${model}`,
    },
    {
      label: `config { id, url, apiKey, headers }`,
      model: {
        id: `${provider}/${model}`,
        url: baseURL,
        apiKey,
        headers: Object.keys(headers).length ? headers : undefined,
      },
    },
    {
      label: `config { providerId, modelId, url, apiKey, headers }`,
      model: {
        providerId: provider,
        modelId: model,
        url: baseURL,
        apiKey,
        headers: Object.keys(headers).length ? headers : undefined,
      },
    },
  ];

  for (const cand of candidates) {
    process.stdout.write(`• ${cand.label} … `);
    try {
      const agent = new Agent({
        id: 'spike',
        name: 'spike',
        instructions: 'You are terse. Reply with exactly the word PONG.',
        model: cand.model,
        // kimi reasoning models reject temperature 0 — use 1.
        defaultOptions: { modelSettings: { temperature: 1 } } as any,
      } as any);
      const res = await agent.generate('ping', { maxSteps: 1 } as any);
      console.log(green(`OK`) + dim(` → "${(res.text || '').trim().slice(0, 60)}"`));
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.log(red(`FAIL`) + dim(` → ${msg.slice(0, 160)}`));
    }
  }
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(red('\n✖ ' + (e?.message || e)));
    process.exit(1);
  });
