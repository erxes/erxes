import { IconDatabase } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { ILogDoc } from '../types';
import { maskFields } from '../utils/logFormUtils';
import { LogDetailJsonPanel, LogDetailSection } from './LogDetailPrimitives';
import { useTranslation } from 'react-i18next';

interface IMongoLogPayload {
  collectionName?: string;
  fullDocument?: unknown;
  updateDescription?: unknown;
}

const formatLabel = (value?: string) => {
  if (!value) {
    return '-';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._:-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function MongoUpdateLogDetailContent({
  payload,
}: {
  payload: IMongoLogPayload;
}) {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const { updateDescription } = payload;

  return (
    <LogDetailJsonPanel
      title={t('change-set')}
      description={t('change-set-description')}
      src={maskFields(updateDescription, ['password'])}
      emptyMessage={t('no-diff')}
    />
  );
}

export const MongoLogDetailContent = ({ payload, action }: ILogDoc) => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const mongoPayload = (payload || {}) as IMongoLogPayload;
  const { collectionName, fullDocument } = mongoPayload;
  const actionLabel = formatLabel(action);
  const collectionLabel = formatLabel(collectionName);
  const currentDocument = maskFields(fullDocument, ['password']);

  return (
    <LogDetailSection
      title={action === 'update' ? t('changes') : t('document-snapshot')}
      description={
        collectionName
          ? t('event-captured', {
              action: actionLabel,
              collection: collectionLabel,
            })
          : t('mongo-change-captured')
      }
      icon={IconDatabase}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
          {actionLabel}
        </Badge>
        {collectionName && (
          <Badge
            variant="secondary"
            className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          >
            {collectionLabel}
          </Badge>
        )}
      </div>

      {action === 'update' ? (
        <MongoUpdateLogDetailContent payload={mongoPayload} />
      ) : (
        <LogDetailJsonPanel
          title={action === 'delete' ? t('removed-document') : t('document')}
          description={t('snapshot-description')}
          src={currentDocument}
          emptyMessage={t('no-snapshot')}
        />
      )}
    </LogDetailSection>
  );
};
