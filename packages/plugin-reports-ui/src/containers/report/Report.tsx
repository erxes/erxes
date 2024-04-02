import { gql } from "@apollo/client";
import Spinner from "@erxes/ui/src/components/Spinner";
import { Alert } from "@erxes/ui/src/utils";
import React from "react";
import Report from "../../components/report/Report";
import { mutations, queries } from "../../graphql";
import {
  ReportDetailQueryResponse,
  ReportsMutationResponse,
} from "../../types";
import { useQuery, useMutation } from "@apollo/client";
import { IReport } from "../../types";

type Props = {
  queryParams: any;
  reportId: string;
};

const ReportList = (props: Props) => {
  const { reportId } = props;

  const reportDetailQuery = useQuery<ReportDetailQueryResponse>(
    gql(queries.reportDetail),
    {
      variables: { reportId },
      fetchPolicy: "network-only",
    }
  );

  const [reportsEditMutation] = useMutation<ReportsMutationResponse>(
    gql(mutations.reportsEdit),
    {
      fetchPolicy: "network-only",
      refetchQueries: ["reportsList"],
    }
  );

  const [reportChartsEditMutation] = useMutation<ReportsMutationResponse>(
    gql(mutations.reportChartsEdit),
    {
      fetchPolicy: "network-only",
      refetchQueries: [
        {
          query: gql(queries.reportDetail),
          variables: {
            reportId,
          },
        },
      ],
    }
  );

  const [reportChartsRemoveMutation] = useMutation<ReportsMutationResponse>(
    gql(mutations.reportChartsRemove),
    {
      fetchPolicy: "network-only",
      refetchQueries: [
        {
          query: gql(queries.reportDetail),
          variables: {
            reportId,
          },
        },
      ],
    }
  );

  if (reportDetailQuery.loading) {
    return <Spinner />;
  }

  const reportsEdit = (_id: string, values: any, callback?: any) => {
    reportsEditMutation({ variables: { _id, ...values } })
      .then(() => {
        Alert.success("Successfully edited report");
        if (callback) {
          callback();
        }
      })
      .catch((err) => Alert.error(err.message));
  };

  const reportChartsEdit = (_id: string, values: any, callback?: any) => {
    reportChartsEditMutation({ variables: { _id, ...values } }).then(() => {
      Alert.success("Successfully edited chart");
      if (callback) {
        callback();
      }
    });
  };

  const reportChartsRemove = (_id: string) => {
    reportChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success("Successfully removed chart");
      })
      .catch((err) => Alert.error(err.message));
  };

  return (
    <Report
      report={reportDetailQuery?.data?.reportDetail || ({} as IReport)}
      reportsEdit={reportsEdit}
      reportChartsEdit={reportChartsEdit}
      reportChartsRemove={reportChartsRemove}
      {...props}
    />
  );
};

export default ReportList;
