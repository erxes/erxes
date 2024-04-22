import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert } from '@erxes/ui/src/utils';
import FilterByParams from '@erxes/ui/src/components/FilterByParams';
import { NoHeight } from '@erxes/ui-inbox/src/inbox/styles';
import Spinner from '@erxes/ui/src/components/Spinner';
import client from '@erxes/ui/src/apolloClient';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';

type Props = {
  query?: { queryName: string; dataName: string; variables?: any };
  fields?: any[];
  counts: string;
  paramKey: string;
  icon?: string;
  queryParams?: any;
  refetchRequired: string;
  multiple?: boolean;
  treeView?: boolean;
  setCounts?: (counts: any) => void;
};

const FilterList: React.FC<Props> = (props) => {
  const {
    query,
    counts,
    queryParams,
    setCounts,
    paramKey,
    icon,
    multiple,
    treeView,
    refetchRequired,
  } = props;

  const [fields, setFields] = useState<any[]>(props.fields || []);
  const [countsData, setCountsData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(props.fields ? false : true);

  const abortController = new AbortController();
  let mounted = false;

  const fetchData = (ignoreCache = false) => {
    mounted = true;

    if (query) {
      const { queryName, dataName, variables = {} } = query;

      client
        .query({
          query: gql(queries[queryName]),
          variables,
        })
        .then(({ data, loading }: any) => {
          if (mounted) {
            setFields(data[dataName]);
            setLoading(loading);
          }
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    }

    client
      .query({
        query: gql(queries.conversationCounts),
        variables: { ...generateParams({ ...queryParams }), only: counts },
        fetchPolicy: ignoreCache ? 'network-only' : 'cache-first',
        // context: {
        //   fetchOptions: { signal: this.abortController.signal }
        // }
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        if (mounted) {
          setCountsData(data.conversationCounts[counts]);
          setLoading(loading);

          if (setCounts) {
            setCounts({ [counts]: data.conversationCounts[counts] });
          }
        }
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  useEffect(() => {
    fetchData();
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (queryParams !== props.queryParams) {
      return fetchData(true);
    }

    if (props.queryParams === queryParams) {
      return;
    }

    return fetchData(true);
  }, [refetchRequired, queryParams]);

  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <Spinner objective={true} />;
  }

  return (
    <NoHeight>
      <FilterByParams
        fields={fields}
        paramKey={paramKey}
        counts={countsData}
        icon={icon}
        loading={false}
        searchable={false}
        multiple={multiple}
        treeView={treeView}
        location={location}
        navigate={navigate}
      />
    </NoHeight>
  );
};

export default FilterList;
