import type { EntryRecord } from '@earendil-works/pi-durable';
import { AGENT_BLOCKS_MAX, AgentBlock } from '@erxes/core-contract';
import { z } from 'zod';
import { agentTool } from './tool';

const SHOW = 'show';

const ShowInput = z.object({ blocks: z.array(AgentBlock).min(1).max(AGENT_BLOCKS_MAX) });

/** Pictures, products, links and payment pages the customer sees below the answer. */
export const showTool = agentTool({
  name: SHOW,
  description:
    'Show the customer pictures, products, links or a payment page below your answer: a product with its photo, price and page, or the link to pay for an order. Take every URL and price from an API result or your instructions, never make one up. Call it before your final answer; your answer text should not repeat the URLs.',
  input: ShowInput,
  execute: ({ blocks }) => ({ shown: blocks.length }),
});

/** Did the entry come from the person talking (an input), not the agent? */
export const isInput = (entry: EntryRecord) =>
  (entry.model ?? []).some((message) => message.role === 'user');

/** What the agent showed in these entries through `show`, in order, each block once. */
export const shownBlocks = (entries: readonly EntryRecord[]) => {
  const shown = entries
    .flatMap((entry) => entry.model ?? [])
    .flatMap((message) => (message.role === 'assistant' ? message.content : []))
    .flatMap((part) => {
      if (part.type !== 'toolCall' || part.name !== SHOW) return [];

      const input = ShowInput.safeParse(part.arguments);

      return input.success ? input.data.blocks : [];
    });

  return [...new Map(shown.map((block) => [JSON.stringify(block), block])).values()].slice(
    0,
    AGENT_BLOCKS_MAX,
  );
};
