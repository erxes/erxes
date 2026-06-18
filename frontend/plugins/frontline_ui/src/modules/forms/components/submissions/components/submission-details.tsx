import {
  Attachments,
  Avatar,
  Badge,
  Button,
  Form,
  Input,
  Sheet,
  Skeleton,
  Spinner,
  Textarea,
  parseFilesAsAttachments,
  readImage,
  useQueryState,
} from 'erxes-ui';
import { useGetFormSubmissionDetails } from '../hooks/useGetFormSubmissionDetails';
import { useSubmissionDetailsForm } from '../hooks/useSubmissionDetailsForm';
import { ISubmissionItem } from '../types';
import { format, parseISO } from 'date-fns';
import {
  IconCheckbox,
  IconCircleDashedCheck,
  IconCircleDashedX,
} from '@tabler/icons-react';

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
  const { formFieldType } = item;

  if (formFieldType === 'core:customer:avatar') {
    return (
      <Avatar size="xl">
        <Avatar.Image
          src={readImage(decodeURIComponent(String(value ?? '')))}
          alt="avatar"
        />
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
        Yes
      </Badge>
    ) : (
      <Badge variant="destructive">
        <IconCircleDashedX size={16} />
        No
      </Badge>
    );
  }

  if (formFieldType === 'date' || formFieldType === 'core:customer:birthDate') {
    const formatted =
      value && typeof value === 'string'
        ? format(new Date(value), 'MMM d, yyyy')
        : '-';
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
  const [submissionId, setSubmissionId] = useQueryState<string>('submissionId');
  const { submissionDetails, loading } = useGetFormSubmissionDetails({
    variables: { _id: submissionId },
    skip: !submissionId,
  });
  const { form, fields } = useSubmissionDetailsForm(submissionDetails);

  return (
    <Sheet
      open={!!submissionId}
      onOpenChange={(open) => {
        if (!open) setSubmissionId(null);
      }}
    >
      <Sheet.View>
        <Sheet.Header>
          {loading ? (
            <Skeleton className="w-32 h-6" />
          ) : submissionDetails?.createdAt ? (
            format(parseISO(submissionDetails.createdAt), 'MMM dd, yyyy')
          ) : (
            '-'
          )}
        </Sheet.Header>
        <Sheet.Content>
          {loading ? (
            <Spinner containerClassName="py-32" />
          ) : (
            <Form {...form}>
              <form className="px-5 py-4 space-y-5">
                {fields.map((item) => (
                  <Form.Field
                    key={item.formFieldId}
                    name={item.formFieldId}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{item.formFieldText}</Form.Label>
                        <SubmissionFieldDisplay
                          item={item}
                          value={field.value}
                        />
                      </Form.Item>
                    )}
                  />
                ))}
                {!fields.length && (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No submission data
                  </p>
                )}
              </form>
            </Form>
          )}
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="secondary" onClick={() => setSubmissionId(null)}>
            Close
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
