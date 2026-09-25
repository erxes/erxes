import { useQueryState } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { broadcastSchema } from '../schema';
import { IBroadcastMethodEnum } from '../types';
import { scheduleFromRange } from '../utils/scheduleForm';
import { useBroadcastContacts } from './useBroadcastContacts';
import { useBroadcastScheduleRange } from './useBroadcastScheduleRange';

export type IBroadcastFormData = z.infer<typeof broadcastSchema>;

const getDefaultValues = (
  method?: IBroadcastMethodEnum,
  // Started from customers picked in the contacts list: they are the
  // audience, so the campaign opens targeted at them rather than at a segment.
  contactIds: string[] = [],
): Partial<IBroadcastFormData> => {
  const base = contactIds.length
    ? {
        targetType: 'customer' as const,
        targetIds: contactIds,
        targetCount: contactIds.length,
        isLive: false,
        isDraft: false,
        title: '',
      }
    : {
        targetType: 'segment' as const,
        targetIds: [],
        targetCount: 0,
        isLive: false,
        isDraft: false,
        title: '',
      };

  if (method === 'notification') {
    return {
      ...base,
      method: 'notification',
      cpId: '',
      notification: {
        inApp: true,
        isMobile: false,
        title: '',
        content: '',
      },
    };
  }

  if (method === 'workflow') {
    return {
      ...base,
      method: 'workflow',
      workflow: { actions: [], entryActionId: undefined },
    };
  }

  if (method === 'messenger') {
    return {
      ...base,
      method: 'messenger',
      fromUserId: '',
      messenger: {
        brandId: '',
        sentAs: 'snippet',
        kind: 'chat',
        content: '',
        rules: [],
      },
    };
  }

  return {
    ...base,
    method: method ?? 'email',
    fromEmail: '',
    email: {
      subject: '',
      sender: '',
      documentId: '',
      previewText: '',
      contentFormat: 'maily' as const,
    },
  };
};

/**
 * @param initialValues a saved campaign read back for editing. Its own method
 * wins over the one in the query string, so an edit sheet cannot be opened
 * into the wrong shape.
 */
const useBroadcastForm = (initialValues?: Partial<IBroadcastFormData>) => {
  const [queryMethod] = useQueryState<IBroadcastMethodEnum>('method');
  const { contactIds } = useBroadcastContacts();
  const method = (initialValues?.method ?? queryMethod ?? undefined) as
    | IBroadcastMethodEnum
    | undefined;

  // Days picked on the calendar arrive as a schedule already filled in, so
  // the campaign is created into them rather than scheduled afterwards. Only
  // on a new campaign: an existing one brought its own.
  const { range } = useBroadcastScheduleRange();
  const planned =
    range && !initialValues
      ? { schedule: scheduleFromRange(range.start, range.end) }
      : undefined;

  const defaultValues = useMemo<Partial<IBroadcastFormData>>(
    () => ({
      ...getDefaultValues(method, contactIds),
      ...planned,
      ...initialValues,
    }),
    // `planned` is rebuilt every render, so the days behind it are what the
    // defaults actually depend on.
    [
      method,
      contactIds.join(','),
      initialValues,
      range?.start.getTime(),
      range?.end.getTime(),
    ],
  );

  const form = useForm<IBroadcastFormData>({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  return { form };
};

export { useBroadcastForm };
