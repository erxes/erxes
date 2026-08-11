import { EnumCursorDirection, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { useParams } from 'react-router-dom';
import { useFieldGroups } from 'ui-modules';
import { PropertiesCommandBar } from './record/PropertiesCommandBar';
import { PropertiesGroupSection } from './record/PropertiesGroupSection';
import { PropertyGroupEditSheet } from './PropertyGroupEdit';

export const PropertyFieldsGroupSettings = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type: contentType } = useParams<{ type: string }>();
  const { fieldGroups, loading, handleFetchMore, pageInfo } = useFieldGroups({
    contentType: contentType || '',
  });

  const [loadMoreRef] = useInView({
    onChange(inView) {
      if (inView) {
        handleFetchMore({ direction: EnumCursorDirection.FORWARD });
      }
    },
  });

  return (
    <>
      <PropertyGroupEditSheet />
      <div className="m-3 max-w-4xl mx-auto flex flex-col gap-2">
        {loading ? (
          <Spinner containerClassName="py-12" />
        ) : fieldGroups.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {t('no-groups-found', 'No field groups found')}
          </div>
        ) : (
          <>
            {fieldGroups.map((group) => (
              <PropertiesGroupSection
                key={group._id}
                group={group}
                contentType={contentType || ''}
              />
            ))}
            {pageInfo?.hasNextPage && (
              <div ref={loadMoreRef}>
                <Spinner containerClassName="py-6" />
              </div>
            )}
          </>
        )}
      </div>
      <PropertiesCommandBar />
    </>
  );
};
