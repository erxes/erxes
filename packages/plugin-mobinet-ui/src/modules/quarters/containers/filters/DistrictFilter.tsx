import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { DistrictsQueryResponse } from '../../../districts/types';

import DistrictFilter from '../../components/filters/DistrictFilter';
import queries from '../../../districts/graphql/queries';

type Props = {
  loadingMainQuery?: boolean;
  abortController?: any;
};

const CityFilterContainer = (props: Props) => {
  const { data, loading, refetch } = useQuery<DistrictsQueryResponse>(
    gql(queries.districtsQuery),
    {
      fetchPolicy: 'network-only',
      skip: props.loadingMainQuery,
      context: {
        fetchOptions: {
          signal: props.abortController && props.abortController.signal
        }
      }
    }
  );

  const updatedProps = {
    ...props,
    districts: (data ? data.districts : []) || [],
    loading: loading,
    counts: { byCity: 0 },
    emptyText: 'Filter districts by city'
  };
  return <DistrictFilter {...updatedProps} />;
};

// type WrapperProps = {
//   abortController?: any;
//   type: string;
//   loadingMainQuery: boolean;
// };

// export default withProps<WrapperProps>(
//   compose(
//     graphql<WrapperProps, CitiesQueryResponse, {}>(gql(queries.brands), {
//       name: 'brandsQuery',
//       skip: ({ loadingMainQuery }) => loadingMainQuery,
//       options: ({ abortController }) => ({
//         context: {
//           fetchOptions: { signal: abortController && abortController.signal }
//         }
//       })
//     }),
//     graphql<WrapperProps, CountQueryResponse, { only: string }>(
//       gql(customerQueries.customerCounts),
//       {
//         name: 'customersCountQuery',
//         skip: ({ loadingMainQuery }) => loadingMainQuery,
//         options: ({ type, abortController }) => ({
//           variables: { type, only: 'byBrand' },
//           context: {
//             fetchOptions: { signal: abortController && abortController.signal }
//           }
//         })
//       }
//     )
//   )(CityFilterContainer)
// );

export default CityFilterContainer;
