import { gql } from "@apollo/client";
import { router } from "@erxes/ui/src/utils";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import * as React from "react";
import { useQuery } from "@apollo/client";
import EmailDelivery from "../components/EmailDelivery";
import queries from "../queries";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
};

export const EMAIL_TYPES = {
  TRANSACTION: "transaction",
  ENGAGE: "engage",
};

function EmailDeliveryContainer(props: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { queryParams } = props;

  const [emailType, setEmailType] = React.useState(
    queryParams.emailType || EMAIL_TYPES.TRANSACTION
  );

  const [status, setStatus] = React.useState(
    queryParams.emailType === EMAIL_TYPES.ENGAGE ? queryParams.status : ''
  );

  React.useEffect(() => {
    const qp = { emailType: emailType || "", status: status || "" };

    router.setParams(navigate, location, qp);
  }, [location, emailType, status]);

  const transactionResponse = useQuery(
    gql(queries.transactionEmailDeliveries),
    {
      variables: {
        searchValue: queryParams.searchValue,
        ...generatePaginationParams(queryParams),
      },
    }
  );

  const engageReportsListResponse = useQuery(gql(queries.engageReportsList), {
    variables: {
      status: queryParams.status,
      customerId: queryParams.customerId,
      ...generatePaginationParams(queryParams),
      searchValue: queryParams.searchValue,
    },
    skip: isEnabled("engages") ? false : true,
  });

  const handleSelectEmailType = (type: string) => {
    setEmailType(type);
    setStatus("");

    if (type === EMAIL_TYPES.TRANSACTION) {
      return router.removeParams(
        navigate,
        location,
        "page",
        "perPage",
        "searchValue",
        "status"
      );
    }

    return router.removeParams(
      navigate,
      location,
      "page",
      "perPage",
      "searchValue"
    );
  };

  const handleSelectStatus = (emailStatus: string) => {
    setStatus(emailStatus);

    return router.setParams(navigate, location, {
      status: emailStatus,
      emailType,
    });
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
    list = emailDeliveries.list || [];
    count = emailDeliveries.totalCount || 0;
    loading = emailDeliveriesLoading;
  } else {
    list = reportsList.list || [];
    count = reportsList.totalCount || 0;
    loading = reportsListLoading;
  }

  const updatedProps = {
    ...props,
    count,
    list,
    loading,
    emailType,
    handleSelectEmailType,
    searchValue: queryParams.searchValue || "",
    handleSelectStatus,
    status,
  };

  return <EmailDelivery {...updatedProps} />;
}

export default EmailDeliveryContainer;
