import { TTemplateJourney, TTemplatePreviewNode } from '@/template/types';
import { IconChevronRight } from '@tabler/icons-react';
import { cn, IconComponent } from 'erxes-ui';

const FALLBACK_ICON = 'IconSparkles';

const Tile = ({
  node,
  accent,
}: {
  node: TTemplatePreviewNode;
  accent?: boolean;
}) => (
  <span
    title={node.label}
    className={cn(
      'flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm',
      accent
        ? 'bg-primary text-primary-foreground'
        : 'bg-background text-primary',
    )}
  >
    <IconComponent name={node.icon || FALLBACK_ICON} className="size-5" />
  </span>
);

/**
 * The journey as a row of icons: trigger, the employee, then what it does.
 * Names stay in tooltips so nothing can overlap at any width.
 */
export const TemplateFlowPreview = ({
  preview,
}: {
  preview: NonNullable<TTemplateJourney['preview']>;
}) => {
  const { trigger, hub, branches } = preview;

  return (
    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-primary/25 via-primary/10 to-primary/5">
      <span className="absolute -left-8 -top-10 size-28 rounded-full bg-primary/30 blur-2xl" />
      <span className="absolute -bottom-12 -right-6 size-28 rounded-full bg-primary/20 blur-2xl" />

      <div className="relative flex items-center gap-1.5">
        <Tile node={trigger} />
        <IconChevronRight className="size-3.5 text-primary/50" />
        {hub && <Tile node={hub} accent />}
        {branches.length > 0 && (
          <IconChevronRight className="size-3.5 text-primary/50" />
        )}
        <div className="flex items-center gap-1.5">
          {branches.map((branch) => (
            <Tile key={branch.label} node={branch} />
          ))}
        </div>
      </div>
    </div>
  );
};
