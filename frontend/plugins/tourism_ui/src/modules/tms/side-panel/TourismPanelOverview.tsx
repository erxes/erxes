import { ReactNode } from 'react';
import { IconPencil } from '@tabler/icons-react';
import { Button, ScrollArea, readImage } from 'erxes-ui';
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
      {onEdit && editLabel && (
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <IconPencil />
            {editLabel}
          </Button>
        </div>
      )}
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
