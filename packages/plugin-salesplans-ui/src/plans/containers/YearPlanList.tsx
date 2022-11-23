import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import YearPlans from '../components/YearPlanList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import { IYearPlan } from '../types';
import {
  YearPlansQueryResponse,
  YearPlansRemoveMutationResponse,
  YearPlansCountQueryResponse,
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
} & Props &
  YearPlansEditMutationResponse &
  YearPlansRemoveMutationResponse;

class YearPlansContainer extends React.Component<FinalProps> {
  render() {
    const {
      yearPlanQuery,
      yearPlansCountQuery,
      queryParams,
      yearPlanEdit,
      yearPlansRemove
    } = this.props;

    if (yearPlanQuery.loading || yearPlansCountQuery.loading) {
      return <Spinner />;
    }

    // edit row action
    const edit = (doc: IYearPlan) => {
      yearPlanEdit({
        variables: { ...doc }
      })
        .then(() => {
          Alert.success('You successfully updated a census');
          yearPlanQuery.refetch();
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

          Alert.success('You successfully deleted a year plan');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const yearPlans = yearPlanQuery.yearPlans || [];
    const totalCount = yearPlansCountQuery.yearPlansCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      yearPlans,
      totalCount,
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
  return ['yearPlans', 'yearPlansCount'];
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
    graphql<Props, YearPlansEditMutationResponse, {}>(
      gql(mutations.yearPlanEdit),
      {
        name: 'yearPlanEdit'
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
