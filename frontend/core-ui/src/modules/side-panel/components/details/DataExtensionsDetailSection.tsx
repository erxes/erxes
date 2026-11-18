import { Collapsible } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionRecordFields,
  useDataExtensionRecordTypes,
} from 'ui-modules';

/**
 * A record's custom fields as one more group at the end of its Detail tab,
 * closed until opened; the fields load when it opens. Nothing is drawn
 * when the record's types have no fields.
 */
export const DataExtensionsDetailSection = ({
  contentType,
  recordId,
}: {
  contentType: string;
  recordId: string;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { recordTypes } = useDataExtensionRecordTypes();

  if (
    !recordTypes.some(
      (recordType) =>
        recordType.fieldCount && recordType.contentTypes.includes(contentType),
    )
  ) {
    return null;
  }

  return (
    <Collapsible className="group border-t px-3 py-2">
      <Collapsible.TriggerButton className="h-7 px-2 text-xs font-medium text-muted-foreground">
        <Collapsible.TriggerIcon className="size-3" />
        {t('section.title')}
      </Collapsible.TriggerButton>
      <Collapsible.Content className="pt-2 pb-2">
        <DataExtensionRecordFields
          contentType={contentType}
          recordId={recordId}
          hideRecordTypeLabels
          className="px-2"
        />
      </Collapsible.Content>
    </Collapsible>
  );
};
