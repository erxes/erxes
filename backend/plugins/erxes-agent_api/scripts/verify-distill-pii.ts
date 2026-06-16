// Verify the distiller redacts PII via its Mastra PIIDetector output processor.
// Run: ERXES_AGENT_MEMORY=enable tsx --env-file=../../../.env scripts/verify-distill-pii.ts
import { generateModels } from '~/connectionResolvers';
import { extractCandidates } from '@/../mastra/learning/extractor';

async function main() {
  const sub = process.env.AGENT_CLI_SUBDOMAIN || 'localhost';
  const models = await generateModels(sub);
  const cfg = await models.MastraAgent.findOne({ agentId: 'test' });
  if (!cfg) throw new Error('no "test" agent configured');
  const providers = await models.MastraProvider.find({ isEnabled: true });

  const transcript = [
    'User: Hi, my name is Batbold Dorj, email batbold@acme.io, phone +976 9911 2233.',
    'Assistant: To reset a deal stage, open the deal and drag the card to the new stage.',
    'User: Thanks! That fixed it. Also my account id is ACME-558123.',
    'Assistant: Glad it worked. The drag-to-stage flow is the standard way to move deals.',
  ].join('\n');

  const candidates = await extractCandidates(
    transcript,
    {
      provider: cfg.provider,
      model: cfg.model,
      providers: providers as never,
      authCtx: { subdomain: sub },
    },
    'user confirmed fix worked',
  );

  console.log(`\nextracted ${candidates.length} candidate(s):`);
  for (const c of candidates) console.log(` - [${c.type}] ${c.statement}`);

  const blob = JSON.stringify(candidates).toLowerCase();
  const leaks = ['batbold', 'batbold@acme.io', '9911 2233', 'acme-558123'].filter(
    (p) => blob.includes(p.toLowerCase()),
  );
  console.log(
    leaks.length
      ? `\n✗ PII LEAKED: ${leaks.join(', ')}`
      : '\n✔ no raw PII survived (name/email/phone/account-id all redacted or skipped)',
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\nFAIL:', e?.stack || e?.message || e);
    process.exit(1);
  });
