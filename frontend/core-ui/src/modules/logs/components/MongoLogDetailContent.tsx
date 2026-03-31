import { IconDatabase } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { ILogDoc } from '../types';
import { maskFields } from '../utils/logFormUtils';
import { LogDetailJsonPanel, LogDetailSection } from './LogDetailPrimitives';

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

export const MongoLogDetailContent = ({ payload, action }: ILogDoc) => {
  const { collectionName, fullDocument } = payload || {};
  const actionLabel = formatLabel(action);
  const collectionLabel = formatLabel(collectionName);
  const currentDocument = maskFields(fullDocument, ['password']);

  return (
    <LogDetailSection
      title={action === 'update' ? 'Changes' : 'Document Snapshot'}
      description={
        collectionName
          ? `${actionLabel} event captured for ${collectionLabel}.`
          : 'Mongo document change captured by the log service.'
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
        <MongoUpdateLogDetailContent payload={payload} />
      ) : (
        <LogDetailJsonPanel
          title={action === 'delete' ? 'Removed Document' : 'Document'}
          description="Snapshot stored with this Mongo change event."
          src={currentDocument}
          emptyMessage="No document snapshot was captured for this event."
        />
      )}
    </LogDetailSection>
  );
};

const MongoUpdateLogDetailContent = ({ payload }: { payload: any }) => {
  const { updateDescription } = payload || {};

  return (
    <LogDetailJsonPanel
      title="Change Set"
      description="Updated fields, removed fields, and array truncations."
      src={maskFields(updateDescription, ['password'])}
      emptyMessage="No field-level diff was captured for this update."
    />
  );
};
