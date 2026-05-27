import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IFormSubmission } from '../types';
import {
  SUBMISSION_DETAILS_SCHEMA,
  SubmissionDetailsFormValues,
} from '../schema';

export const useSubmissionDetailsForm = (submissionDetails?: IFormSubmission) => {
  const form = useForm<SubmissionDetailsFormValues>({
    resolver: zodResolver(SUBMISSION_DETAILS_SCHEMA),
    defaultValues: {},
  });

  useEffect(() => {
    if (!submissionDetails?.submissions) return;

    const values: SubmissionDetailsFormValues = {};
    for (const item of submissionDetails.submissions) {
      const raw = item.value ?? item.text;
      values[item.formFieldId] =
        typeof raw === 'object' && raw !== null ? JSON.stringify(raw) : raw;
    }
    form.reset(values);
  }, [submissionDetails]);

  return {
    form,
    fields: submissionDetails?.submissions ?? [],
  };
};
