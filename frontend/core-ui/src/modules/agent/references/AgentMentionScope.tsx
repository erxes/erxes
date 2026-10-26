import type { ReactNode } from 'react';

import type { IAgentMention } from '../utils/mentionText';
import {
  AgentReferenceProvider,
  useAgentReferenceRegistry,
} from './AgentReferenceScope';
import { referenceIdentity } from './referenceRegistry';

/**
 * Lets a user bubble render its own mention tokens as record chips. Only
 * the message's `data-agents-mentions` part, which the server verifies as
 * the signed-in user before storing, adds identities; chip clicks still
 * re-resolve the record before navigating. Tool evidence keeps precedence.
 */
export const AgentMentionScope = ({
  mentions,
  children,
}: {
  mentions: IAgentMention[];
  children: ReactNode;
}) => {
  const parent = useAgentReferenceRegistry();
  // The provider keeps the previous registry while its key is unchanged.
  const registry = mentions.length
    ? {
        key: `${parent.key}|mentions:${JSON.stringify(mentions)}`,
        byHandle: parent.byHandle,
        byIdentity: new Map([
          ...mentions.map(
            (mention) => [referenceIdentity(mention), mention] as const,
          ),
          ...parent.byIdentity,
        ]),
      }
    : parent;
  return (
    <AgentReferenceProvider registry={registry}>
      {children}
    </AgentReferenceProvider>
  );
};
