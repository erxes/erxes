import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import React from 'react';
import YearPlans from '../components/YearPlanList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import { IYearPlan } from '../types';
import {
  YearPlansQueryResponse,
  YearPlansRemoveMutationResponse,
  YearPlansCountQueryResponse,
  YearPlansSumQueryResponse,
  YearPlansEditMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  yearPlanQuery: YearPlansQueryResponse;
  yearPlansCountQuery: YearPlansCountQueryResponse;
  yearPlansSumQuery: YearPlansSumQueryResponse;
} & Props &
  YearPlansEditMutationResponse &
  YearPlansRemoveMutationResponse;

class YearPlansContainer extends React.Component<FinalProps> {
  render() {
    const {
      yearPlanQuery,
      yearPlansCountQuery,
      yearPlansSumQuery,
      queryParams,
      yearPlanEdit,
      yearPlansRemove
    } = this.props;

    // edit row action
    const edit = (doc: IYearPlan) => {
      yearPlanEdit({
        variables: { ...doc }
      })
        .then(() => {
          Alert.success('You successfully updated a day plan');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // remove action
    const remove = ({ yearPlanIds }, emptyBulk) => {
      yearPlansRemove({
        variables: { _ids: yearPlanIds }
      })
        .then(() => {
          emptyBulk();

          Alert.success('You successfully deleted a day plan');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const yearPlans = yearPlanQuery.yearPlans || [];
    const totalCount = yearPlansCountQuery.yearPlansCount || 0;
    const totalSum = yearPlansSumQuery.yearPlansSum || {};

    const updatedProps = {
      ...this.props,
      queryParams,
      yearPlans,
      totalCount,
      totalSum,
      edit,
      remove,
      searchValue
    };

    const yearPlanList = props => <YearPlans {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.yearPlanQuery.refetch();
    };

    return <Bulk content={yearPlanList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['yearPlans', 'yearPlansCount', 'yearPlansSum'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

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
  endDate: queryParams.endDate
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, YearPlansQueryResponse>(
      gql(queries.yearPlans),
      {
        name: 'yearPlanQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, YearPlansCountQueryResponse>(
      gql(queries.yearPlansCount),
      {
        name: 'yearPlansCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, YearPlansSumQueryResponse>(
      gql(queries.yearPlansSum),
      {
        name: 'yearPlansSumQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, YearPlansEditMutationResponse, {}>(
      gql(mutations.yearPlanEdit),
      {
        name: 'yearPlanEdit',
        options
      }
    ),
    graphql<Props, YearPlansRemoveMutationResponse, { yearPlanIds: string[] }>(
      gql(mutations.yearPlansRemove),
      {
        name: 'yearPlansRemove',
        options
      }
    )
  )(YearPlansContainer)
);
