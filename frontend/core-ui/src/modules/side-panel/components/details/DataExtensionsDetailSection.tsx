import { useTranslation } from 'react-i18next';
import { DataExtensionRecordFields } from 'ui-modules';

/** A record's custom fields as one more group at the end of its Detail tab. */
export const DataExtensionsDetailSection = ({
  contentType,
  recordId,
}: {
  contentType: string;
  recordId: string;
}) => {
  const { t } = useTranslation('dataExtensions');

  return (
    <section className="border-t px-3 pt-3 pb-4">
      <h3 className="px-2 pb-2 text-xs font-medium text-muted-foreground">
        {t('section.title')}
      </h3>
      <DataExtensionRecordFields
        contentType={contentType}
        recordId={recordId}
        className="px-2"
      />
    </section>
  );
};
