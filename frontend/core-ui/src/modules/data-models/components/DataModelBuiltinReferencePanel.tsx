import { gql, useQuery } from '@apollo/client';
import { ScrollArea } from 'erxes-ui';
import { useMemo } from 'react';
import { Can, RecordSidePanel, type IRecordViewProps } from 'ui-modules';
import {
  withBuiltinModelFields,
  type BuiltinModelRecord,
} from '../builtinDocuments';
import { useBuiltinModelFields } from '../useBuiltinModelFields';
import { BuiltinModelFields } from './BuiltinModelFields';
import { DataModelError, DataModelLoading } from './DataModelFeedback';

const documents = {
  product: gql`
    query dataModelsUiProductReference($_id: String!) {
      productDetail(_id: $_id) {
        _id
        name
        code
        unitPrice
        currency
      }
    }
  `,
  user: gql`
    query dataModelsUiUserReference($_id: String!) {
      userDetail(_id: $_id) {
        _id
        username
        email
        details {
          firstName
          lastName
          location
          operatorPhone
        }
      }
    }
  `,
};
interface ReferenceRecord extends BuiltinModelRecord {
  name?: string | null;
  code?: string | null;
  unitPrice?: number | null;
  currency?: string | null;
  username?: string | null;
  email?: string | null;
  details?: {
    firstName?: string | null;
    lastName?: string | null;
    location?: string | null;
    operatorPhone?: string | null;
  } | null;
}

export const DataModelBuiltinReferencePanel = (props: IRecordViewProps) => {
  const model =
    props.record.contentType === 'core:product' ? 'product' : 'user';
  return (
    <Can
      action={model === 'product' ? 'productsRead' : 'teamMembersRead'}
      fallback={
        <>
          <RecordSidePanel.Header
            title="Record unavailable"
            onBack={props.onBack}
            onClose={props.onClose}
          />
          <p role="alert" className="p-5 text-sm text-muted-foreground">
            You do not have permission to view this record.
          </p>
        </>
      }
    >
      <ReferenceDetail {...props} model={model} />
    </Can>
  );
};

const ReferenceDetail = ({
  model,
  ...props
}: IRecordViewProps & { model: 'product' | 'user' }) => {
  const metadata = useBuiltinModelFields(model);
  const document = useMemo(
    () =>
      withBuiltinModelFields(documents[model], model, metadata.fields, [
        [`${model}Detail`],
      ]),
    [model, metadata.fields],
  );
  const { data, loading, error, refetch } = useQuery<{
    productDetail?: ReferenceRecord | null;
    userDetail?: ReferenceRecord | null;
  }>(document, {
    variables: { _id: props.record.contentId },
    skip: metadata.loading,
    fetchPolicy: 'cache-and-network',
  });
  const record = data?.[`${model}Detail`];
  const title =
    record?.name ||
    [record?.details?.firstName, record?.details?.lastName]
      .filter(Boolean)
      .join(' ') ||
    record?.username ||
    record?.email ||
    (model === 'product' ? 'Product' : 'Team member');
  const rows =
    model === 'product'
      ? [
          ['Code', record?.code],
          [
            'Price',
            record?.unitPrice == null
              ? null
              : `${record.unitPrice} ${record.currency ?? ''}`,
          ],
        ]
      : [
          ['Email', record?.email],
          ['Phone', record?.details?.operatorPhone],
          ['Location', record?.details?.location],
        ];
  return (
    <>
      <RecordSidePanel.Header
        title={title}
        onBack={props.onBack}
        onClose={props.onClose}
      />
      {error ? (
        <DataModelError
          error={error}
          onRetry={() => {
            void refetch().catch(() => undefined);
          }}
        />
      ) : metadata.error ? (
        <DataModelError error={metadata.error} onRetry={metadata.retry} />
      ) : (loading || metadata.loading) && !record ? (
        <DataModelLoading />
      ) : !record ? (
        <p className="p-5 text-sm text-muted-foreground">
          This record is no longer available.
        </p>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-5">
            <dl className="space-y-4">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words text-sm">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            <BuiltinModelFields model={model} record={record} />
          </div>
        </ScrollArea>
      )}
    </>
  );
};
