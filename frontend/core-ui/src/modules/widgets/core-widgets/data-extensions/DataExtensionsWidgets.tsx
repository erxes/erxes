import { IconSettings, IconVariable } from '@tabler/icons-react';
import { Button, ScrollArea, SideMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DataExtensionRecordFields, IRelationWidgetProps } from 'ui-modules';

/**
 * Data Extension fields of whatever record a detail page shows. Registered
 * for every content type that has fields, so module pages list none
 * themselves.
 */
export const DataExtensionsWidgets = ({
  contentId,
  contentType,
  access,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('dataExtensions');

  return (
    <SideMenu.Content value="dataExtensions" className="bg-sidebar">
      <SideMenu.Header label={t('section.title')} Icon={IconVariable}>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/data-extensions">
            <IconSettings />
            {t('widget.manage')}
          </Link>
        </Button>
      </SideMenu.Header>
      <ScrollArea className="flex-1 min-h-0">
        <DataExtensionRecordFields
          contentType={contentType}
          recordId={contentId}
          readOnly={access === 'read'}
          className="p-4"
        />
      </ScrollArea>
    </SideMenu.Content>
  );
};
