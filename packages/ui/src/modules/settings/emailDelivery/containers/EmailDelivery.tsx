import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import * as React from 'react';
import { useQuery } from 'react-apollo';
import EmailDelivery from '../components/EmailDelivery';
import queries from '../queries';

type Props = {
  queryParams: any;
} & IRouterProps;

export const EMAIL_TYPES = {
  TRANSACTION: 'transaction',
  ENGAGE: 'engage'
};

function EmailDeliveryContainer(props: Props) {
  const { history, queryParams } = props;

  const [emailType, setEmailType] = React.useState(
    queryParams.emailType || EMAIL_TYPES.TRANSACTION
  );

  const [status, setStatus] = React.useState(
    queryParams.emailType === EMAIL_TYPES.ENGAGE && queryParams.status
  );

  React.useEffect(() => {
    const qp = { emailType: emailType || '', status: status || '' };

    router.setParams(history, qp);
  }, [history, emailType, status]);

  const transactionResponse = useQuery(
    gql(queries.transactionEmailDeliveries),
    {
      variables: {
        searchValue: queryParams.searchValue,
        ...generatePaginationParams(queryParams)
      }
    }
  );

  const engageReportsListResponse = useQuery(gql(queries.engageReportsList), {
    variables: {
      status: queryParams.status,
      customerId: queryParams.customerId,
      ...generatePaginationParams(queryParams)
    }
  });

  const handleSelectEmailType = (type: string) => {
    setEmailType(type);
    setStatus('');

    if (type === EMAIL_TYPES.TRANSACTION) {
      return router.removeParams(
        history,
        'page',
        'perPage',
        'searchValue',
        'status'
      );
    }

    return router.removeParams(history, 'page', 'perPage', 'searchValue');
  };

  const handleSelectStatus = (emailStatus: string) => {
    setStatus(emailStatus);

    return router.setParams(history, { status: emailStatus, emailType });
  };

  const transactionData = transactionResponse.data || {};
  const emailDeliveries = transactionData.transactionEmailDeliveries || {};
  const emailDeliveriesLoading = transactionResponse.loading;

  const engageReportsListData = engageReportsListResponse.data || {};
  const reportsList = engageReportsListData.engageReportsList || {};
  const reportsListLoading = engageReportsListResponse.loading;

  let list;
  let count;
  let loading;

  if (emailType === EMAIL_TYPES.TRANSACTION) {
    list = emailDeliveries.list;
    count = emailDeliveries.totalCount;
    loading = emailDeliveriesLoading;
  } else {
    list = reportsList.list;
    count = reportsList.totalCount;
    loading = reportsListLoading;
  }

  const updatedProps = {
    ...props,
    count,
    list,
    loading,
    emailType,
    handleSelectEmailType,
    history,
    searchValue: queryParams.searchValue || '',
    handleSelectStatus,
    status
  };

  return <EmailDelivery {...updatedProps} />;
}

export default EmailDeliveryContainer;
