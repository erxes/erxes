import { ReactNode } from 'react';
import { IconPencil } from '@tabler/icons-react';
import { Button, ScrollArea } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { PanelField } from 'ui-modules';

export const TourismPanelOverview = ({
  title,
  thumbnailUrl,
  editLabel,
  onEdit,
  fields,
  children,
}: {
  title: string;
  thumbnailUrl?: string;
  editLabel?: string;
  onEdit?: () => void;
  fields: { label: string; value: ReactNode }[];
  children?: ReactNode;
}) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="flex flex-col gap-3 p-3">
      {thumbnailUrl && (
        <img
          src={readImage(thumbnailUrl, 600)}
          alt={title}
          className="aspect-video w-full rounded-md object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 break-words text-base font-semibold">{title}</h3>
        {onEdit && editLabel && (
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <IconPencil />
            {editLabel}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {fields.map(({ label, value }) => (
          <PanelField key={label} label={label} cell={false}>
            <div className="flex min-h-7 flex-wrap items-center gap-1 px-2 text-xs">
              {value || <span className="text-muted-foreground">-</span>}
            </div>
          </PanelField>
        ))}
      </div>
      {children}
    </div>
  </ScrollArea>
);
