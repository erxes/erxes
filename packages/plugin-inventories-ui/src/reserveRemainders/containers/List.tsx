import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import ReserveRems from '../components/List';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import { IReserveRem } from '../types';
import {
  ReserveRemsQueryResponse,
  ReserveRemsRemoveMutationResponse,
  ReserveRemsCountQueryResponse,
  ReserveRemsEditMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  reserveRemQuery: ReserveRemsQueryResponse;
  reserveRemsCountQuery: ReserveRemsCountQueryResponse;
} & Props &
  ReserveRemsEditMutationResponse &
  ReserveRemsRemoveMutationResponse;

class ReserveRemsContainer extends React.Component<FinalProps> {
  render() {
    const {
      reserveRemQuery,
      reserveRemsCountQuery,
      queryParams,
      reserveRemEdit,
      reserveRemsRemove
    } = this.props;

    if (reserveRemQuery.loading || reserveRemsCountQuery.loading) {
      return <Spinner />;
    }

    // edit row action
    const edit = (doc: IReserveRem) => {
      reserveRemEdit({
        variables: { ...doc }
      })
        .then(() => {
          Alert.success('You successfully updated a labels');
          reserveRemQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // remove action
    const remove = ({ reserveRemIds }, emptyBulk) => {
      reserveRemsRemove({
        variables: { _ids: reserveRemIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.reserveRemsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const reserveRems = reserveRemQuery.reserveRems || [];
    const totalCount = reserveRemsCountQuery.reserveRemsCount || 0;

    const updatedProps = {
      ...this.props,
      searchValue,
      queryParams,
      reserveRems,
      totalCount,
      edit,
      remove
    };

    const reserveRemList = props => (
      <ReserveRems {...updatedProps} {...props} />
    );

    const refetch = () => {
      this.props.reserveRemQuery.refetch();
    };

    return <Bulk content={reserveRemList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['reserveRems', 'reserveRemsCount'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  _ids: queryParams._ids,
  date: queryParams.date,
  searchValue: queryParams.searchValue,
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productId: queryParams.productId,
  productCategoryId: queryParams.productCategoryId,
  dateType: queryParams.dateType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, ReserveRemsQueryResponse>(
      gql(queries.reserveRems),
      {
        name: 'reserveRemQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, ReserveRemsCountQueryResponse>(
      gql(queries.reserveRemsCount),
      {
        name: 'reserveRemsCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ReserveRemsEditMutationResponse, {}>(
      gql(mutations.reserveRemEdit),
      {
        name: 'reserveRemEdit'
      }
    ),
    graphql<
      Props,
      ReserveRemsRemoveMutationResponse,
      { reserveRemIds: string[] }
    >(gql(mutations.reserveRemsRemove), {
      name: 'reserveRemsRemove',
      options
    })
  )(ReserveRemsContainer)
);
