import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { FORM_WIDGET_DATA } from '../graphql/queries/getFormWidgetData';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';
import type {
  FormWidgetDataQuery,
  FormWidgetDataQueryVariables,
} from '~/gql/graphql';

export const useFormWidgetData = (
  options: QueryHookOptions<FormWidgetDataQuery, FormWidgetDataQueryVariables>,
) => {
  const { data, loading } = useQuery(FORM_WIDGET_DATA, options);

  const conversationMessages = useMemo(
    () => compactList(data?.conversationMessages).map(toMessage),
    [data?.conversationMessages],
  );

  return {
    conversationMessages,
    loading,
  };
};
