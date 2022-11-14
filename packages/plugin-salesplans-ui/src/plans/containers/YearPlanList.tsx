import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import YearPlans from '../components/YearPlanList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  YearPlansQueryResponse,
  YearPlansRemoveMutationResponse,
  YearPlansCountQueryResponse
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
  YearPlansRemoveMutationResponse;

class YearPlansContainer extends React.Component<FinalProps> {
  render() {
    const {
      yearPlanQuery,
      yearPlansCountQuery,
      queryParams,
      yearPlansRemove
    } = this.props;

    if (yearPlanQuery.loading || yearPlansCountQuery.loading) {
      return <Spinner />;
    }

    // remove action
    const remove = ({ yearPlanIds }, emptyBulk) => {
      yearPlansRemove({
        variables: { _ids: yearPlanIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.yearPlansRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';
    const minMultiplier = this.props.queryParams.minMultiplier;
    const maxMultiplier = this.props.queryParams.maxMultiplier;

    const yearPlans = yearPlanQuery.yearPlans || [];
    const totalCount = yearPlansCountQuery.yearPlansCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      yearPlans,
      totalCount,
      remove,
      searchValue,
      filterStatus,
      minMultiplier,
      maxMultiplier
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
    graphql<Props, YearPlansRemoveMutationResponse, { yearPlanIds: string[] }>(
      gql(mutations.yearPlansRemove),
      {
        name: 'yearPlansRemove',
        options
      }
    )
  )(YearPlansContainer)
);
