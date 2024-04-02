import * as compose from "lodash.flowright";
import { gql, useQuery, useMutation } from "@apollo/client";
import React from "react";
import YearPlans from "../components/YearPlanList";
import { Alert, router, withProps } from "@erxes/ui/src/utils";
import { Bulk } from "@erxes/ui/src/components";
import { graphql } from "@apollo/client/react/hoc";
import { mutations, queries } from "../graphql";
import { IYearPlan } from "../types";
import {
  YearPlansQueryResponse,
  YearPlansRemoveMutationResponse,
  YearPlansCountQueryResponse,
  YearPlansSumQueryResponse,
  YearPlansEditMutationResponse,
} from "../types";

type Props = {
  queryParams: any;
  type?: string;
};

const YearPlanListContainer = (props: Props) => {
  const { queryParams } = props;

  const yearPlanQuery = useQuery<YearPlansQueryResponse>(
    gql(queries.yearPlans),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );
  const yearPlansCountQuery = useQuery<YearPlansCountQueryResponse>(
    gql(queries.yearPlansCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );
  const yearPlansSumQuery = useQuery<YearPlansSumQueryResponse>(
    gql(queries.yearPlansSum),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const [yearPlanEdit] = useMutation<YearPlansEditMutationResponse>(
    gql(mutations.yearPlanEdit),
    {
      refetchQueries: ["yearPlans", "yearPlansCount", "yearPlansSum"],
    }
  );
  const [yearPlansRemove] = useMutation<YearPlansRemoveMutationResponse>(
    gql(mutations.yearPlansRemove),
    {
      refetchQueries: ["yearPlans", "yearPlansCount", "yearPlansSum"],
    }
  );

  // edit row action
  const edit = (doc: IYearPlan) => {
    yearPlanEdit({
      variables: { ...doc },
    })
      .then(() => {
        Alert.success("You successfully updated a day plan");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  // remove action
  const remove = ({ yearPlanIds }, emptyBulk) => {
    yearPlansRemove({
      variables: { _ids: yearPlanIds },
    })
      .then(() => {
        emptyBulk();

        Alert.success("You successfully deleted a day plan");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const yearPlanList = (bulkProps) => {
    const searchValue = queryParams.searchValue || "";
    const yearPlans = yearPlanQuery?.data?.yearPlans || [];
    const totalCount = yearPlansCountQuery?.data?.yearPlansCount || 0;
    const totalSum = yearPlansSumQuery?.data?.yearPlansSum || {};
    const loading =
      yearPlanQuery.loading ||
      yearPlansCountQuery.loading ||
      yearPlansSumQuery.loading;

    const updatedProps = {
      ...props,
      queryParams,
      yearPlans,
      totalCount,
      loading,
      totalSum,
      edit,
      remove,
      searchValue,
    };

    return <YearPlans {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    yearPlanQuery.refetch();
    yearPlansCountQuery.refetch();
  };

  return <Bulk content={yearPlanList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  _ids: queryParams._ids,
  searchValue: queryParams.searchValue,
  year: Number(queryParams.year),
  filterStatus: queryParams.filterStatus,
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productId: queryParams.productId,
  productCategoryId: queryParams.productCategoryId,
  minValue: queryParams.minValue,
  maxValue: queryParams.maxValue,
  dateType: queryParams.dateType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
});

export default YearPlanListContainer;
