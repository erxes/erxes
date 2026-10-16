import { ApolloCache, useMutation, useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { GET_REPORT_CHARTS } from '@/report/graphql/queries/getReportCharts';
import {
  ADD_REPORT_CHART,
  REMOVE_REPORT_CHART,
} from '@/report/graphql/mutations/reportChartMutations';
import { ReportChart } from '@/report/types';

const NO_CHARTS: ReportChart[] = [];

const REPORT_CHARTS_VARIABLES = {};

const updateCachedCharts = (
  cache: ApolloCache<unknown>,
  update: (charts: ReportChart[]) => ReportChart[],
) => {
  const cached = cache.readQuery({
    query: GET_REPORT_CHARTS,
    variables: REPORT_CHARTS_VARIABLES,
  });

  if (!cached) {
    return;
  }

  cache.writeQuery({
    query: GET_REPORT_CHARTS,
    variables: REPORT_CHARTS_VARIABLES,
    data: {
      reportCharts: update((cached.reportCharts ?? []).filter(isDefined)),
    },
  });
};

export const useReportCharts = () => {
  const { data, loading, error } = useQuery(GET_REPORT_CHARTS, {
    variables: REPORT_CHARTS_VARIABLES,
  });

  return {
    reportCharts: data?.reportCharts?.filter(isDefined) ?? NO_CHARTS,
    loading,
    error,
  };
};

export const useReportChartMutations = () => {
  const [addReportChart, { loading: adding }] = useMutation(ADD_REPORT_CHART, {
    update: (cache, { data }) => {
      const created = data?.reportChartAdd;

      if (created) {
        updateCachedCharts(cache, (charts) => [...charts, created]);
      }
    },
  });

  const [removeReportChart, { loading: removing }] = useMutation(
    REMOVE_REPORT_CHART,
    {
      update: (cache, { data }) => {
        const removedId = data?.reportChartRemove?._id;

        if (removedId) {
          updateCachedCharts(cache, (charts) =>
            charts.filter((chart) => chart._id !== removedId),
          );
        }
      },
    },
  );

  return { addReportChart, adding, removeReportChart, removing };
};
