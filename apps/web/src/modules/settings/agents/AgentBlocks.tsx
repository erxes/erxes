import type { AgentBlock } from '@erxes/core-contract';
import { IconCreditCard, IconExternalLink } from '@tabler/icons-react';
import { buttonVariants } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const Block = ({ block }: { block: AgentBlock }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });

  switch (block.kind) {
    case 'image':
      return <img src={block.url} alt={block.alt ?? ''} className="max-h-60 rounded-md border" />;
    case 'product':
      return (
        <div className="flex w-64 flex-col overflow-hidden rounded-lg border bg-background">
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.title} className="h-36 w-full object-cover" />
          )}
          <div className="space-y-1 p-3">
            <p className="font-medium">{block.title}</p>
            {block.price && <p className="text-sm">{block.price}</p>}
            {block.text && <p className="text-sm text-muted-foreground">{block.text}</p>}
            {block.url && (
              <a
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary-text underline"
              >
                <IconExternalLink aria-hidden className="size-4" />
                {t('view-product', 'View product')}
              </a>
            )}
          </div>
        </div>
      );
    case 'link':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
        >
          <IconExternalLink />
          {block.title}
        </a>
      );
    case 'payment':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: 'sm' })}
        >
          <IconCreditCard />
          {block.amount ? `${block.title} · ${block.amount}` : block.title}
        </a>
      );
  }
};

/** What the agent showed below its answer, as a customer's widget would show it. */
export const AgentBlocks = ({ blocks }: { blocks: AgentBlock[] }) =>
  blocks.length > 0 && (
    <div className="flex flex-wrap items-start gap-2">
      {blocks.map((block) => (
        // Core sends each block once, so its content is its key.
        <Block key={JSON.stringify(block)} block={block} />
      ))}
    </div>
  );
