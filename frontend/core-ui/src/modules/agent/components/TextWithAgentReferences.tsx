import { Children, type ReactNode } from 'react';

import { AgentReferenceChip } from './AgentReferenceChip';
import { parseAgentReferences } from '../references/parseAgentReferences';
import type { IAgentReference } from '../references/parseAgentReferences';
import { AGENT_REFERENCE_PLACEHOLDER_PATTERN } from '../references/maskAgentReferences';

/**
 * Renders a text run with `[[type:id:label]]` tokens replaced by inline
 * record chips. Unparseable or unclosed tokens stay literal text. Used for
 * plain (non-markdown) text like user bubbles — markdown-rendered text
 * goes through `withMaskedReferences` instead.
 */
export const TextWithAgentReferences = ({ text }: { text: string }) => {
  const segments = parseAgentReferences(text);

  if (segments.length === 1 && segments[0].kind === 'text') {
    return <>{text}</>;
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

/** Maps masked text (`AGENTREF<n>XREF`) back to chips. */
const TextWithMaskedReferences = ({
  text,
  references,
}: {
  text: string;
  references: IAgentReference[];
}) => {
  const children: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  AGENT_REFERENCE_PLACEHOLDER_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(AGENT_REFERENCE_PLACEHOLDER_PATTERN)) {
    const reference = references[Number(match[1])];
    if (!reference) {
      continue;
    }
    if (match.index > cursor) {
      children.push(text.slice(cursor, match.index));
    }
    children.push(<AgentReferenceChip key={index} reference={reference} />);
    index += 1;
    cursor = match.index + match[0].length;
  }

  if (cursor === 0) {
    return <>{text}</>;
  }

  children.push(text.slice(cursor));
  return <>{children}</>;
};

/**
 * Applies `TextWithMaskedReferences` to the string children of a markdown
 * element, leaving nested elements untouched. `references` is the index →
 * reference map produced by `maskAgentReferences` before markdown ran, so
 * labels containing emphasis characters survive the parse. Chips render
 * inside p/li/td/th/heading/strong/em/blockquote text but never inside
 * code, pre, or anchors — those renderers are simply absent.
 */
export const withMaskedReferences = (
  children: ReactNode,
  references: IAgentReference[],
): ReactNode =>
  Children.map(children, (child) =>
    typeof child === 'string' ? (
      <TextWithMaskedReferences text={child} references={references} />
    ) : (
      child
    ),
  );
