import { useQuery } from '@apollo/client';
import { Button } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { createReverseRelationDocument } from '../recordDocuments';
import type { DataModel, ModelField } from '../types';
import { DataModelRelationValue } from './DataModelRelationValue';
import { dataModelErrorMessage } from '../errorMessage';

export const DataModelReverseRelationValue = ({
  model,
  field,
  recordId,
}: {
  model: Pick<DataModel, 'name' | 'source'>;
  field: ModelField;
  recordId: string;
}) => {
  const [offset, setOffset] = useState(0);
  const document = useMemo(
    () => createReverseRelationDocument(model, field),
    [model.name, model.source, field],
  );
  const { data, loading, error, refetch } = useQuery<{
    record: { _id: string; links: { _id: string }[] | null } | null;
  }>(document, {
    variables: { _id: recordId, offset },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const links = data?.record?.links ?? [];
  if (error)
    return (
      <div role="alert" className="text-xs text-destructive">
        {dataModelErrorMessage(error)}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void refetch().catch(() => undefined);
          }}
        >
          Try again
        </Button>
      </div>
    );
  if (loading && !data)
    return (
      <p role="status" className="text-xs text-muted-foreground">
        Loading links…
      </p>
    );
  return (
    <div className="space-y-2">
      <DataModelRelationValue
        field={field}
        fields={[field]}
        read={() => links.slice(0, 25)}
      />
      {(offset > 0 || links.length > 25) && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || !offset}
            onClick={() => setOffset(Math.max(0, offset - 25))}
          >
            Previous links
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {offset / 25 + 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || links.length <= 25}
            onClick={() => setOffset(offset + 25)}
          >
            Next links
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Links update from the related records. Open one to change its
        connection.
      </p>
    </div>
  );
};
