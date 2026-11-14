import {
  Attachments,
  Avatar,
  Badge,
  Button,
  Form,
  Input,
  Empty,
  Skeleton,
  Spinner,
  Textarea,
  parseFilesAsAttachments,
} from 'erxes-ui';
import { useGetFormSubmissionDetails } from '../hooks/useGetFormSubmissionDetails';
import { useSubmissionDetailsForm } from '../hooks/useSubmissionDetailsForm';
import { ISubmissionItem } from '../types';
import { getFormAvatarSrc } from '@/forms/utils/getFormAvatarUrl';
import { format, parseISO } from 'date-fns';
import {
  IconCheckbox,
  IconCircleDashedCheck,
  IconCircleDashedX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ActivityLogs,
  getSidePanelRecordPath,
  type IRecordPanelProps,
  useSidePanel,
} from 'ui-modules';
import { FORM_SUBMISSION_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';

const parseChecks = (value: unknown): string[] => {
  if (!value) return [];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [value];
    }
  }
  if (Array.isArray(value)) return value as string[];
  return [];
};

const SubmissionFieldDisplay = ({
  item,
  value,
}: {
  item: ISubmissionItem;
  value: unknown;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const { formFieldType } = item;

  if (
    formFieldType === 'core:customer:avatar' ||
    formFieldType === 'core:company:avatar'
  ) {
    return (
      <Avatar size="xl">
        <Avatar.Image src={getFormAvatarSrc(value)} alt="avatar" />
        <Avatar.Fallback>C</Avatar.Fallback>
      </Avatar>
    );
  }

  if (formFieldType === 'file') {
    return (
      <Attachments.Root
        initialAttachments={parseFilesAsAttachments(value)}
        confirmRemove={() => false}
      >
        <Attachments.Preview />
        <Attachments.Files />
      </Attachments.Root>
    );
  }

  if (formFieldType === 'check') {
    const checks = parseChecks(value);
    if (!checks.length)
      return <span className="text-muted-foreground text-sm">-</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {checks.map((c) => (
          <Badge key={c} variant="info" className="rounded-lg">
            <IconCheckbox size={12} />
            {c}
          </Badge>
        ))}
      </div>
    );
  }

  if (formFieldType === 'radio') {
    return (
      <Badge variant="info" className="rounded-lg">
        <IconCheckbox size={12} />
        {String(value ?? '-')}
      </Badge>
    );
  }

  if (formFieldType === 'boolean') {
    return String(value) === 'true' ? (
      <Badge variant="success">
        <IconCircleDashedCheck size={16} />
        {t('yes', 'Yes')}
      </Badge>
    ) : (
      <Badge variant="destructive">
        <IconCircleDashedX size={16} />
        {t('no', 'No')}
      </Badge>
    );
  }

  if (formFieldType === 'date' || formFieldType === 'core:customer:birthDate') {
    const dateValue = typeof value === 'string' ? value : '';
    const date = new Date(dateValue);
    const formatted = Number.isNaN(date.getTime())
      ? dateValue || '-'
      : format(date, 'MMM d, yyyy');
    return <Input value={formatted} readOnly className="bg-muted" />;
  }

  if (formFieldType === 'textarea' || formFieldType === 'html') {
    return (
      <Textarea
        value={String(value ?? '')}
        readOnly
        className="bg-muted resize-none"
        rows={3}
      />
    );
  }

  return <Input value={String(value ?? '')} readOnly className="bg-muted" />;
};

export const SubmissionDetails = () => {
  const [searchParams] = useSearchParams();
  const { pathname, hash, state } = useLocation();
  const navigate = useNavigate();
  const submissionId = searchParams.get('submissionId');

  useEffect(() => {
    if (!submissionId) return;
    const next = new URLSearchParams(searchParams);
    next.delete('submissionId');
    next.set(
      'panel',
      getSidePanelRecordPath({
        contentType: FORM_SUBMISSION_CONTENT_TYPE,
        contentId: submissionId,
      }),
    );
    navigate(
      { pathname, search: next.toString(), hash },
      { replace: true, state },
    );
  }, [submissionId, searchParams, pathname, hash, state, navigate]);

  return null;
};

/** Displays submission details and activity through the record-panel views. */
export const FormSubmissionRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const { close, back, canGoBack } = useSidePanel();
  const { submissionDetails, loading, error } = useGetFormSubmissionDetails({
    variables: { _id: contentId },
    skip: contentId === 'new',
  });
  const { form, fields } = useSubmissionDetailsForm(submissionDetails);

  if (view === 'title') {
    if (loading && !submissionDetails) return <Skeleton className="h-4 w-32" />;
    if (!submissionDetails?.createdAt) return '-';
    const date = parseISO(submissionDetails.createdAt);
    return Number.isNaN(date.getTime())
      ? submissionDetails.createdAt
      : format(date, 'MMM dd, yyyy');
  }
  if (view === 'actions') return null;
  if (view === 'activity')
    return <ActivityLogs targetId={contentId} showInternalNotes={false} />;
  if (loading && !submissionDetails)
    return <Spinner containerClassName="py-12" />;
  if (!submissionDetails)
    return (
      <Empty className="m-3">
        <Empty.Header>
          <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
          {error && <Empty.Description>{error.message}</Empty.Description>}
        </Empty.Header>
      </Empty>
    );

  return (
    <SettingsPanelForm>
      <div className="min-h-0 flex-1 overflow-auto">
        <Form {...form}>
          <form className="px-5 py-4 space-y-5">
            {fields.map((item) => (
              <Form.Field
                key={item.formFieldId}
                name={item.formFieldId}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{item.formFieldText}</Form.Label>
                    <SubmissionFieldDisplay item={item} value={field.value} />
                  </Form.Item>
                )}
              />
            ))}
            {!fields.length && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {t('no-submission-data', 'No submission data')}
              </p>
            )}
          </form>
        </Form>
      </div>
      <div className="flex shrink-0 justify-end border-t p-3">
        <Button
          variant="secondary"
          onClick={() => (canGoBack ? back() : close())}
        >
          {t('close', 'Close')}
        </Button>
      </div>
    </SettingsPanelForm>
  );
};
