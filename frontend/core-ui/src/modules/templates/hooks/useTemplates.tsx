import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { QUERY_TEMPLATES } from '../graphql/queries';

export const useTemplatesVariables = () => {
  const [{ contentType }] = useMultiQueryState<{
    contentType: string;
  }>(['contentType']);

  return {
    type: contentType || undefined,
  };
};

export const useTemplates = () => {
  const variables = useTemplatesVariables();

  const { data, loading, fetchMore } = useQuery(QUERY_TEMPLATES, {
    variables,
  });

  const { list: templates, pageInfo } = data?.templateList || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 20,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          templateList: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.templateList,
            prevResult: prev.templateList,
          }),
        });
      },
    });
  };

  return {
    templates,
    pageInfo,
    loading,
    handleFetchMore,
  };
};
