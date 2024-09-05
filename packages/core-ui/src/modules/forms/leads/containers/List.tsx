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


const FORMS_QUERY = gql`
  ${queries.forms}
`;

const FORMS_TOTAL_COUNT_QUERY = gql`
  ${queries.formsTotalCount}
`;


// const INTEGRATIONS_TOTAL_COUNT_QUERY = gql`
//   ${queries.integrationsTotalCount}
// `;

// const REMOVE_MUTATION = gql`
//   ${mutations.integrationRemove}
// `;

// const ARCHIVE_MUTATION = gql`
//   ${mutations.integrationsArchive}
// `;

// const COPY_MUTATION = gql`
//   ${mutations.formCopy}
// `;

type Props = {
  queryParams: any;
  location?: any;
};

const ListContainer: React.FC<Props> = ({ queryParams, location }) => {
  console.log("leads container")
  const { data, refetch, loading } = useQuery(FORMS_QUERY, {
    variables: {
      ...generatePaginationParams(queryParams),
      tag: queryParams.tag,
      brandId: queryParams.brand,
      kind: INTEGRATION_KINDS.FORMS,
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
      kind: 'lead',
      tag: queryParams.tag,
      brandId: queryParams.brand,
      status: queryParams.status,
    },
  });

  // const [removeMutation] = useMutation('REMOVE_MUTATION');
  // const [archiveMutation] = useMutation(ARCHIVE_MUTATION);
  // const [copyMutation] = useMutation('COPY_MUTATION');

  useEffect(() => {
    const shouldRefetchList = routerUtils.getParam(location, 'popUpRefetchList');
    if (shouldRefetchList) {
      refetch();
    }
  }, [location, refetch]);

  useEffect(() => {
    refetch();
  }, [queryParams.page, refetch]);

  // const remove = useCallback(
  //   (integrationId: string) => {
  //     const message =
  //       'If you delete a form, all previous submissions and contacts gathered through this form will also be deleted. Are you sure?';

  //     confirm(message).then(() => {
  //       removeMutation({
  //         variables: { _id: integrationId },
  //       })
  //         .then(() => {
  //           refetch();
  //           Alert.success('You successfully deleted a form.');
  //         })
  //         .catch((e) => {
  //           Alert.error(e.message);
  //         });
  //     });
  //   },
  //   [removeMutation, refetch]
  // );

  // const archive = useCallback(
  //   (integrationId: string, status: boolean) => {
  //     let message = `If you archive this form, the live form on your website or erxes messenger will no longer be visible. But you can still see the contacts and submissions you've received.`;
  //     let action = 'archived';

  //     if (!status) {
  //       message = 'You are going to unarchive this form. Are you sure?';
  //       action = 'unarchived';
  //     }

  //     confirm(message).then(() => {
  //       archiveMutation({ variables: { _id: integrationId, status } })
  //         .then(({ data }) => {
  //           const integration = data.integrationsArchive;

  //           if (integration) {
  //             Alert.success(`Form has been ${action}.`);
  //           }

  //           refetch();
  //         })
  //         .catch((e: Error) => {
  //           Alert.error(e.message);
  //         });
  //     });
  //   },
  //   [archiveMutation, refetch]
  // );

  // const copy = useCallback(
  //   (integrationId: string) => {
  //     copyMutation({
  //       variables: { _id: integrationId },
  //     })
  //       .then(() => {
  //         refetch();
  //         Alert.success('You successfully copied a form.');
  //       })
  //       .catch((e) => {
  //         Alert.error(e.message);
  //       });
  //   },
  //   [copyMutation, refetch]
  // );

  const forms = data?.forms || [];
  const counts = countData?.integrationsTotalCount || null;

  const totalCount = (counts && counts.total) || 0;

  const updatedProps = {
    forms,
    counts,
    totalCount,
    // remove,
    loading,
    // archive,
    // copy,
    refetch,
  };

  const content = (props: any) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={content} refetch={refetch} />;
};

export default ListContainer;
