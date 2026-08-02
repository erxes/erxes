import {
  EMAIL_RAMP_RELEASE,
  EMAIL_RAMP_STATUS,
} from '@/settings/email-ramp/graphql/queries';
import { IEmailRampStatus } from '@/settings/email-ramp/types';
import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';

export const useEmailRampStatus = () => {
  const { data, loading, error } = useQuery<{
    emailRampStatus: IEmailRampStatus;
  }>(EMAIL_RAMP_STATUS);

  return { status: data?.emailRampStatus, loading, error };
};

/**
 * The mutation returns the whole status, so Apollo writes the new tier and
 * cleared halt straight into the cache the panel is already reading.
 */
export const useResumeSending = () => {
  const { toast } = useToast();

  const [mutate, { loading }] = useMutation(EMAIL_RAMP_RELEASE);

  const resume = (note: string) =>
    mutate({
      variables: { note },
      update: (cache, { data }) => {
        if (!data?.emailRampRelease) {
          return;
        }

        cache.writeQuery({
          query: EMAIL_RAMP_STATUS,
          data: { emailRampStatus: data.emailRampRelease },
        });
      },
      onCompleted: () =>
        toast({ title: 'Sending resumed', variant: 'success' }),
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });

  return { resume, loading };
};
