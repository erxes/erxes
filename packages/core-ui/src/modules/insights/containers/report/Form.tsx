import React from "react";

import { gql, useQuery, useMutation } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert/index";
import Spinner from "@erxes/ui/src/components/Spinner";

import Form from "../../components/report/Form";
import { queries, mutations } from "../../graphql";
import {
  ReportDetailQueryResponse,
  ReportEditMutationResponse,
  ReportFormMutationVariables,
  InsightTemplatesListQueryResponse,
} from "../../types";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;

  reportId?: string;

  closeDrawer: () => void;
};

const FormContainer = (props: Props) => {
  const { queryParams, reportId, closeDrawer } = props;
  const navigate = useNavigate();

  const reportDetailQuery = useQuery<ReportDetailQueryResponse>(
    gql(queries.reportDetail),
    {
      skip: !reportId,
      variables: { reportId },
    }
  );

  const reportTemplatesListQuery = useQuery<InsightTemplatesListQueryResponse>(
    gql(queries.insightTemplatesList)
  );

  const [reportAddMutation] = useMutation(gql(mutations.reportAdd), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: "report" },
      },
      {
        query: gql(queries.reportList),
      },
    ],
  });

  const [reportEditMutation] = useMutation(gql(mutations.reportEdit), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: "report" },
      },
      {
        query: gql(queries.reportList),
      },
      {
        query: gql(queries.reportDetail),
        variables: {
          reportId,
        },
      },
      {
        query: gql(queries.insightPinnedList),
      },
    ],
  });

  const handleMutation = (values: ReportFormMutationVariables) => {
    if (reportId) {
      return reportEditMutation({
        variables: { _id: reportId, ...values },
      })
        .then(() => {
          closeDrawer();

          Alert.success("Successfully edited report");
          navigate(`/insight?reportId=${reportId}`);
        })
        .catch((err) => Alert.error(err.message));
    }

    reportAddMutation({ variables: { ...values } })
      .then((res) => {
        closeDrawer();

        Alert.success("Successfully created report");
        const { _id } = res.data.reportAdd;
        if (_id) {
          navigate(`/insight?reportId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  if (reportDetailQuery.loading) {
    return <Spinner />;
  }

  const report = reportDetailQuery?.data?.reportDetail;
  const loading = reportDetailQuery.loading;
  const reportTemplates =
    reportTemplatesListQuery?.data?.insightTemplatesList || [];

  const updatedProps = {
    ...props,
    report,
    loading,
    reportTemplates,
    handleMutation,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
