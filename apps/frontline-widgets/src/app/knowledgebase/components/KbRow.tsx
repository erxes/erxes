import { IconChevronRight, type Icon } from '@tabler/icons-react';

export const KbRow = ({
  title,
  description,
  meta,
  icon: RowIcon,
  onClick,
}: {
  title: string;
  description?: string | null;
  meta?: string;
  icon?: Icon;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-xl bg-background p-3 text-left shadow-xs transition-shadow duration-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    {RowIcon && (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <RowIcon size={18} />
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold text-foreground">
        {title}
      </span>
      {description && (
        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
          {description}
        </span>
      )}
      {meta && (
        <span className="mt-1 block text-[11px] font-medium text-muted-foreground">
          {meta}
        </span>
      )}
    </span>
    <IconChevronRight
      size={16}
      className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
    />
  </button>
);
