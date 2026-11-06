import { IconDotsVertical, IconPrinter } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, PrintDocument } from 'ui-modules';

export const DocumentPrintMenu = ({
  items,
  contentType,
}: Pick<ComponentProps<typeof PrintDocument>, 'items' | 'contentType'>) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const { t: commonT } = useTranslation('common');
  const [printOpen, setPrintOpen] = useState(false);

  return (
    <Can action="documentsRead">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={commonT('navigation.more-actions')}
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onSelect={() => setPrintOpen(true)}>
            <IconPrinter /> {t('print')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <PrintDocument
        items={items}
        contentType={contentType}
        open={printOpen}
        onOpenChange={setPrintOpen}
        trigger={null}
      />
    </Can>
  );
};
