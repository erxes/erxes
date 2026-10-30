import { useAgentReferenceRegistry } from '../references/AgentReferenceScope';
import { bindAgentReferenceHandles } from '../references/referenceRegistry';

import { AgentReferenceChip } from './AgentReferenceChip';
import { parseAgentReferences } from '../references/parseAgentReferences';

/**
 * Renders a text run with `[[type:id:label]]` tokens replaced by inline
 * record chips. Unparseable or unclosed tokens stay literal text. Used for
 * plain text like user bubbles; HTML replies use `htmlReferences.ts`.
 */
export const TextWithAgentReferences = ({ text }: { text: string }) => {
  const registry = useAgentReferenceRegistry();
  const bound = bindAgentReferenceHandles(text, registry);
  const segments = parseAgentReferences(bound);

  if (segments.length === 1 && segments[0].kind === 'text') {
    return <>{bound}</>;
  }

  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === 'text' ? (
          segment.text
        ) : (
          <AgentReferenceChip key={index} reference={segment.reference} />
        ),
      )}
    </>
  );
};
