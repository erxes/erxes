import { IconListDetails, IconSettings } from '@tabler/icons-react';
import { Button, ScrollArea, SideMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FieldsInDetail, mutateFunction } from 'ui-modules';

const EMPTY_PROPERTIES_DATA: Record<string, unknown> = {};

export const PropertiesSidePanel = ({
  contentType,
  contentId,
  propertiesData,
  mutateHook,
}: {
  contentType: 'operation:task' | 'operation:project';
  contentId: string;
  propertiesData?: Record<string, unknown>;
  mutateHook: () => { mutate: mutateFunction; loading: boolean };
}) => {
  const { t } = useTranslation('operation');

  return (
    <>
      <SideMenu.Header
        Icon={IconListDetails}
        label={t('properties', { defaultValue: 'Properties' })}
      >
        <Button variant="secondary" asChild>
          <Link
            to={`/settings/properties/${contentType}`}
            aria-label={t('manage-properties', {
              defaultValue: 'Manage properties',
            })}
          >
            <IconSettings className="size-4" />
            {t('manage', { defaultValue: 'Manage' })}
          </Link>
        </Button>
      </SideMenu.Header>
      <ScrollArea
        className="min-h-0 flex-auto"
        viewportClassName="[&>div]:!block [&>div]:h-full"
      >
        <FieldsInDetail
          bare
          className="h-full min-w-0 p-4 [&_.grid-cols-2]:grid-cols-1"
          fieldContentType={contentType}
          id={contentId}
          propertiesData={propertiesData ?? EMPTY_PROPERTIES_DATA}
          mutateHook={mutateHook}
        />
      </ScrollArea>
    </>
  );
};
