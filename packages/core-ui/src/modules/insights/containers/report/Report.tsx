import React from "react";

import { gql, useQuery, useMutation } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { __ } from "@erxes/ui/src/utils/index";
import { router } from "@erxes/ui/src/utils";

import Report from "../../components/report/Report";
import { queries, mutations } from "../../graphql";
import {
  IReport,
  ChartFormMutationVariables,
  ReportDetailQueryResponse,
} from "../../types";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const ReportContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const reportQuery = useQuery<ReportDetailQueryResponse>(
    gql(queries.reportDetail),
    {
      skip: !queryParams.reportId,
      variables: {
        reportId: queryParams.reportId,
      },
      fetchPolicy: "network-only",
    }
  );

  const [reportDuplicateMutation] = useMutation(
    gql(mutations.reportDuplicate),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: "report" },
        },
        {
          query: gql(queries.reportList),
        },
      ],
    }
  );

  const [reportRemoveMutation] = useMutation(gql(mutations.reportRemove), {
    refetchQueries: [
      {
        query: gql(queries.reportList),
      },
    ],
  });

  const reportDuplicate = (_id: string) => {
    reportDuplicateMutation({ variables: { _id } })
      .then((res) => {
        Alert.success("Successfully duplicated report");
        const { _id } = res.data.reportDuplicate;
        if (_id) {
          navigate(`/insight?reportId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const reportRemove = (ids: string[]) => {
    confirm(__("Are you sure to delete selected reports?")).then(() => {
      reportRemoveMutation({ variables: { ids } })
        .then(() => {
          if (ids.includes(queryParams.reportId)) {
            router.removeParams(
              navigate,
              location,
              ...Object.keys(queryParams)
            );
          }
          Alert.success(__("Successfully deleted"));
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const [reportChartsEditMutation] = useMutation(gql(mutations.chartsEdit));

  const [reportChartsRemoveMutation] = useMutation(
    gql(mutations.chartsRemove),
    {
      refetchQueries: ["reportsList", "reportDetail", "insightPinnedList"],
    }
  );

  const reportChartsEdit = (
    _id: string,
    values: ChartFormMutationVariables
  ) => {
    reportChartsEditMutation({ variables: { _id, ...values } });
  };

  const reportChartsRemove = (_id: string) => {
    reportChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success("Successfully removed chart");
      })
      .catch((err) => Alert.error(err.message));
  };

  const report = reportQuery?.data?.reportDetail || ({} as IReport);
  const loading = reportQuery.loading;

  const updatedProps = {
    ...props,
    report,
    loading,
    reportChartsRemove,
    reportChartsEdit,
    reportDuplicate,
    reportRemove,
  };

  return <Report {...updatedProps} />;
};

export default ReportContainer;
