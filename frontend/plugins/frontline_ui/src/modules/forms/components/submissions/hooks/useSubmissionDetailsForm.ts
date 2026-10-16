import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isDefined } from 'erxes-ui';
import { IFormSubmissionDetail, ISubmissionItem } from '../types';
import {
  SUBMISSION_DETAILS_SCHEMA,
  SubmissionDetailsFormValues,
} from '../schema';

const hasFormFieldId = (
  item: ISubmissionItem,
): item is ISubmissionItem & { formFieldId: string } => !!item.formFieldId;

export const useSubmissionDetailsForm = (
  submissionDetails?: IFormSubmissionDetail,
) => {
  const form = useForm<SubmissionDetailsFormValues>({
    resolver: zodResolver(SUBMISSION_DETAILS_SCHEMA),
    defaultValues: {},
  });

  const fields = (submissionDetails?.submissions ?? [])
    .filter(isDefined)
    .filter(hasFormFieldId);

  useEffect(() => {
    if (!submissionDetails?.submissions) return;

    const values: SubmissionDetailsFormValues = {};
    for (const item of submissionDetails.submissions
      .filter(isDefined)
      .filter(hasFormFieldId)) {
      const raw = item.value ?? item.text;
      values[item.formFieldId] =
        typeof raw === 'object' && raw !== null ? JSON.stringify(raw) : raw;
    }
    form.reset(values);
  }, [submissionDetails]);

  return {
    form,
    fields,
  };
};
