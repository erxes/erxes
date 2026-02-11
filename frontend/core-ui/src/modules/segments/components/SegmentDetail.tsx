import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { SegmentForm } from 'ui-modules';
import { useTranslation } from 'react-i18next';

type Props = {
  onRefresh: () => void;
};

export function SegmentDetail({ onRefresh }: Props) {
  const [selectedContentType] = useQueryState<string>('contentType');

  
  const [segmentId, setOpen] = useQueryState<string>('segmentId');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { t } = useTranslation('segment');
  if (!selectedContentType) {
    return null;
  }

  return (
    <Sheet
      open={!!segmentId || isCreatingNew}
      onOpenChange={() => {
        if (segmentId) {
          setOpen(null);
        } else {
          setIsCreatingNew(!isCreatingNew);
        }
      }}
    >
      <Sheet.Trigger asChild>
        <Button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          disabled={!selectedContentType}
        >
          <IconPlus /> {t('create-segment')}
        </Button>
      </Sheet.Trigger>

      <Sheet.View
        className="p-0 md:max-w-5xl"
        onEscapeKeyDown={(e: any) => {
          e.preventDefault();
        }}
      >
        <Sheet.Content className="h-full">
          <div className="h-full flex flex-col">
            <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
              <Sheet.Title>{`${segmentId ? t('edit') : t('create')} ${t(
                'a-segment',
              )}`}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <SegmentForm
              contentType={selectedContentType}
              segmentId={segmentId || ''}
              callback={onRefresh}
            />
          </div>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
