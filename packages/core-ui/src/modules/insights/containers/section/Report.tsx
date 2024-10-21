import React from "react";
import * as compose from 'lodash.flowright';
import { gql, useQuery, useMutation } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { __ } from "@erxes/ui/src/utils/index";
import { router } from "@erxes/ui/src/utils";

import ReportSection from "../../components/section/Report";
import { queries, mutations } from "../../graphql";
import {
  ReportRemoveMutationResponse,
  ReportsListQueryResponse,
  SectionsListQueryResponse
} from "../../types";
import { useLocation, useNavigate } from "react-router-dom";
import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";
import { IUser } from "@erxes/ui/src/auth/types";

type Props = {
  queryParams: any;
};

type FinalProps = {
  currentUser: IUser
} & Props

const ReportSectionContainer = (props: FinalProps) => {
  const { queryParams, currentUser } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const reportsQuery = useQuery<ReportsListQueryResponse>(
    gql(queries.reportList)
  );
  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: {
        type: "report"
      }
    }
  );

  const [reportUpdate] = useMutation(gql(mutations.reportEdit), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: "report" },
      },
      {
        query: gql(queries.reportList),
      },
      {
        query: gql(queries.insightPinnedList),
      },
    ],
  });

  const [reportsRemoveManyMutation] = useMutation<ReportRemoveMutationResponse>(
    gql(mutations.reportRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: "report" }
        },
        {
          query: gql(queries.reportList)
        },
        {
          query: gql(queries.insightPinnedList),
        },
      ]
    }
  );

  const updateReport = (_id: string) => {
    reportUpdate({
      variables: { _id, userId: currentUser._id },
    })
  };

  const removeReports = (id: string) => {
    confirm(__("Are you sure to delete selected reports?")).then(() => {
      reportsRemoveManyMutation({ variables: { id } })
        .then(() => {
          if (queryParams.reportId === id) {
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

  const sections = sectionsQuery?.data?.sections || [];
  const { list = [], totalCount = 0 } = reportsQuery?.data?.reportList || {};
  const loading = reportsQuery.loading && sectionsQuery.loading;

  const updatedProps = {
    ...props,
    reports: list,
    sections,
    loading,
    updateReport,
    removeReports
  };

  return <ReportSection {...updatedProps} />;
};

export default compose(withCurrentUser(ReportSectionContainer));
