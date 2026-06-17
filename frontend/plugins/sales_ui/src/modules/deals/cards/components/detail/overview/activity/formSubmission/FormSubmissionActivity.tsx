import { ReactNode } from 'react';
import { IconForms } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useQuery } from '@apollo/client';
import { useRelations } from 'ui-modules';
import {
  IDealFormSubmission,
  ISubmissionItem,
  useDealFormSubmissions,
} from './useDealFormSubmissions';
import { GET_CONVERSATION_FORM_WIDGET, GET_FORM_TITLE } from './graphql';

interface IFormWidgetItem {
  _id: string;
  type?: string;
  text?: string;
  value?: unknown;
  column?: number;
}

interface IConversationMessage {
  _id: string;
  content?: string;
  createdAt?: string;
  formWidgetData?: IFormWidgetItem[];
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => formatValue(v)).join(', ') : '-';
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.value === 'string') return record.value;
    if (typeof record.name === 'string') return record.name;
    return JSON.stringify(value);
  }
  return String(value);
};

const FormHeader = ({ createdAt }: { createdAt?: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <IconForms className="size-4 text-muted-foreground" />
    <span className="text-muted-foreground">submitted a</span>
    <span className="font-medium">Form</span>
    {createdAt ? (
      <span className="ml-auto text-xs text-muted-foreground">
        {format(new Date(createdAt), 'MMM dd, yyyy HH:mm')}
      </span>
    ) : null}
  </div>
);

const FieldGrid = ({
  title,
  fields,
}: {
  title?: ReactNode;
  fields: { _id: string; label?: string; value: unknown }[];
}) => {
  if (!fields.length) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-lg border">
      <div className="bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
        {title || 'Form'}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field._id} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {field.label}
            </span>
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm wrap-break-word">
              {formatValue(field.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fallback: render a submission coming from the frontline_form_submissions store
const FormTitleFromForm = ({ formId }: { formId?: string }) => {
  const { data } = useQuery<{
    formDetail: { _id: string; title?: string; name?: string };
  }>(GET_FORM_TITLE, { variables: { _id: formId }, skip: !formId });
  return data?.formDetail?.title || data?.formDetail?.name || 'Form';
};

const SubmissionBlock = ({
  submission,
}: {
  submission: IDealFormSubmission;
}) => {
  const fields = (submission.submissions || [])
    .filter((f: ISubmissionItem) => f.formFieldText)
    .map((f) => ({
      _id: f._id,
      label: f.formFieldText,
      value: f.value ?? f.text,
    }));

  if (!fields.length) return null;

  return (
    <div className="pb-4">
      <FormHeader createdAt={submission.createdAt} />
      <FieldGrid
        title={<FormTitleFromForm formId={submission.formId} />}
        fields={fields}
      />
    </div>
  );
};

export const FormSubmissionActivity = ({
  dealId,
  customerId,
  sourceConversationIds,
}: {
  dealId: string;
  customerId?: string;
  sourceConversationIds?: string[];
}) => {
  // A deal created from a conversation is linked to it through a relation
  // (sales:deal <-> frontline:conversation), so resolve related conversations.
  const { ownEntities } = useRelations({
    variables: {
      contentId: dealId,
      contentType: 'sales:deal',
      relatedContentType: 'frontline:conversation',
    },
    skip: !dealId,
  });

  const relatedConversationIds = (ownEntities || [])
    .filter((entity) => entity.contentType === 'frontline:conversation')
    .map((entity) => entity.contentId);

  const conversationIds = Array.from(
    new Set([...(sourceConversationIds || []), ...relatedConversationIds]),
  );
  const conversationId = conversationIds[0];

  // Primary source: the form data saved on the conversation message.
  const { data: msgData, loading: msgLoading } = useQuery<{
    conversationMessages: IConversationMessage[];
  }>(GET_CONVERSATION_FORM_WIDGET, {
    variables: { conversationId, limit: 20 },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  const formMessages = (msgData?.conversationMessages || []).filter(
    (message) =>
      Array.isArray(message.formWidgetData) &&
      message.formWidgetData.length > 0,
  );

  // Fallback source: the frontline_form_submissions store.
  const { submissions, loading: subLoading } = useDealFormSubmissions({
    customerId,
    contentTypeIds: conversationIds,
  });

  if (msgLoading || subLoading) return null;

  const hasWidgetData = formMessages.length > 0;

  if (!hasWidgetData && submissions.length === 0) return null;

  return (
    <div className="px-6 pb-2">
      {hasWidgetData
        ? formMessages.map((message) => (
            <div key={message._id} className="pb-4">
              <FormHeader createdAt={message.createdAt} />
              <FieldGrid
                title={message.content}
                fields={(message.formWidgetData || []).map((item) => ({
                  _id: item._id,
                  label: item.text,
                  value: item.value,
                }))}
              />
            </div>
          ))
        : submissions.map((submission) => (
            <SubmissionBlock key={submission._id} submission={submission} />
          ))}
    </div>
  );
};
