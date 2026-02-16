import { useQuery } from '@apollo/client';
import { PREVIEW_ADJUST_CLOSING } from '../graphql/adjustClosingPreview';

export const useAdjustClosingPreview = (variables?: {
  beginDate?: Date;
  date?: Date;
  accountIds?: string[];
}) => {
  return useQuery(PREVIEW_ADJUST_CLOSING, {
    variables,
    skip:
      !variables?.beginDate ||
      !variables?.date ||
      !variables?.accountIds?.length,
  });
};
