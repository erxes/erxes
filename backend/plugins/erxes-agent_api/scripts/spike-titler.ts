// SPIKE — does agent.generateTitleFromUserMessage() work with our config-object
// (Kimi) model? Run: tsx --env-file=../../../.env scripts/spike-titler.ts --agent test
import { Agent } from '@mastra/core/agent';
import { generateModels } from '~/connectionResolvers';
import { buildModel, type ProviderDocLike } from '~/mastra/providers';
import { TITLER_INSTRUCTIONS } from '~/mastra/titler';

async function main() {
  const agentId =
    process.argv.includes('--agent')
      ? process.argv[process.argv.indexOf('--agent') + 1]
      : 'test';
  const models = await generateModels(process.env.AGENT_CLI_SUBDOMAIN || 'localhost');
  const a = (await models.MastraAgent.findOne({ agentId }).lean()) as any;
  const providers = (await models.MastraProvider.find({
    isEnabled: true,
  }).lean()) as ProviderDocLike[];

  const agent = new Agent({
    id: 'spike-titler',
    name: 'spike-titler',
    instructions: TITLER_INSTRUCTIONS,
    model: buildModel(a.provider, a.model, providers),
  }) as any;

  const title = await agent.generateTitleFromUserMessage({
    messages: [
      { role: 'user', content: 'How do I set up a lead follow-up automation?' },
      {
        role: 'assistant',
        content:
          'You can build a workflow that triggers on a new lead and sends a follow-up message.',
      },
    ],
    instructions: TITLER_INSTRUCTIONS,
  });
  console.log(`\n${a.provider}/${a.model} → title: "${title}"\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAIL:', e?.message || e);
    process.exit(1);
  });
