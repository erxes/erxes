import { gql } from '@apollo/client';

import Bulk from '@erxes/ui/src/components/Bulk';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import { Alert, confirm } from '@erxes/ui/src/utils';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React, { useCallback, useEffect } from 'react';
import List from '../components/List';

import { useMutation, useQuery } from '@apollo/client';
import queries from '../../queries';
import mutations from '../../mutations';

const FORMS_QUERY = gql`
  ${queries.forms}
`;

const FORMS_TOTAL_COUNT_QUERY = gql`
  ${queries.formsTotalCount}
`;

// const INTEGRATIONS_TOTAL_COUNT_QUERY = gql`
//   ${queries.integrationsTotalCount}
// `;

const REMOVE_MUTATION = gql`
  ${mutations.formRemove}
`;

const TOGGLE_STATUS = gql`
  ${mutations.formToggleStatus}
`;

const COPY_MUTATION = gql`
  ${mutations.formCopy}
`;

type Props = {
  queryParams: any;
  location?: any;
  navigate?: any;
};

const ListContainer: React.FC<Props> = (props: Props) => {
  const { location, queryParams } = props;

  const { data, refetch, loading } = useQuery(FORMS_QUERY, {
    variables: {
      ...generatePaginationParams(queryParams),
      tag: queryParams.tag,
      brandId: queryParams.brand,
      type: 'lead',
      status: queryParams.status,
      sortField: queryParams.sortField,
      searchValue: queryParams.searchValue,
      sortDirection: queryParams.sortDirection
        ? parseInt(queryParams.sortDirection, 10)
        : undefined,
    },
  });

  const { data: countData } = useQuery(FORMS_TOTAL_COUNT_QUERY, {
    variables: {
      type: 'lead',
      tag: queryParams.tag,
      brandId: queryParams.brand,
      status: queryParams.status,
    },
  });

  const [removeMutation] = useMutation(REMOVE_MUTATION);
  const [toggleStatusMutation] = useMutation(TOGGLE_STATUS);
  const [copyMutation] = useMutation(COPY_MUTATION);

  useEffect(() => {
    const shouldRefetchList = routerUtils.getParam(
      location,
      'popUpRefetchList'
    );
    if (shouldRefetchList) {
      refetch();
    }
  }, [location, refetch]);

  useEffect(() => {
    refetch();
  }, [queryParams.page, refetch]);

  const remove = useCallback(
    (formId: string) => {
      const message =
        'If you delete a form, all previous submissions and contacts gathered through this form will also be deleted. Are you sure?';

      confirm(message).then(() => {
        removeMutation({
          variables: { id: formId },
        })
          .then(() => {
            refetch();
            Alert.success('You successfully deleted a form.');
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      });
    },
    [removeMutation, refetch]
  );

  const archive = useCallback(
    (formId: string, status: string) => {
      let message = `If you archive this form, the live form on your website or erxes messenger will no longer be visible. But you can still see the contacts and submissions you've received.`;
      let action = 'archived';

      if (!status) {
        message = 'You are going to unarchive this form. Are you sure?';
        action = 'unarchived';
      }

      confirm(message).then(() => {
        toggleStatusMutation({ variables: { id: formId } })
          .then(({ data }) => {
            const form = data.formsToggleStatus;

            if (form) {
              Alert.success('Form status has changed');
            }

            refetch();
          })
          .catch((e: Error) => {
            Alert.error(e.message);
          });
      });
    },
    [toggleStatusMutation, refetch]
  );

  const copy = useCallback(
    (formId: string) => {
      copyMutation({
        variables: { id: formId },
      })
        .then(() => {
          refetch();
          Alert.success('You successfully copied a form.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    },
    [copyMutation, refetch]
  );

  const forms = data?.forms || [];
  const counts = countData?.formsTotalCount || null;

  const totalCount = (counts && counts.total) || 0;

  const updatedProps = {
    ...props,
    forms,
    counts,
    totalCount,
    remove,
    loading,
    archive,
    copy,
    refetch,
   
  };

  const content = (props: any) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={content} refetch={refetch} />;
};

export default ListContainer;
