import client from 'apolloClient';
import gql from 'graphql-tag';
import FilterByParams from 'modules/common/components/FilterByParams';
import Spinner from 'modules/common/components/Spinner';
import { Alert } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { NoHeight } from 'modules/inbox/styles';
import { generateParams } from 'modules/inbox/utils';
import React from 'react';

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
};

type State = {
  fields: any[];
  counts: any;
  loading: boolean;
};

export default class FilterList extends React.PureComponent<Props, State> {
  mounted: boolean;

  constructor(props: Props) {
    super(props);

    let loading = true;

    if (props.fields) {
      loading = false;
    }

    this.mounted = false;

    this.state = {
      fields: props.fields || [],
      counts: {},
      loading
    };
  }

  fetchData(ignoreCache = false) {
    const { query, counts, queryParams } = this.props;

    this.mounted = true;

    // Fetching filter lists channels, brands, tags etc
    if (query) {
      const { queryName, dataName, variables = {} } = query;
      client
        .query({
          query: gql(queries[queryName]),
          variables
        })
        .then(({ data }: any) => {
          if (this.mounted) {
            this.setState({ fields: data[dataName] });
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }

    // Fetching count query
    client
      .query({
        query: gql(queries.conversationCounts),
        variables: { ...generateParams({ ...queryParams }), only: counts },
        fetchPolicy: ignoreCache ? 'network-only' : 'cache-first'
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        if (this.mounted) {
          this.setState({ counts: data.conversationCounts[counts], loading });
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps) {
    const { queryParams, refetchRequired } = this.props;

    if (prevProps.refetchRequired !== refetchRequired) {
      return this.fetchData(true);
    }

    if (prevProps.queryParams === queryParams) {
      return;
    }

    return this.fetchData(true);
  }

  render() {
    const { paramKey, icon, multiple, treeView } = this.props;
    const { counts, fields, loading } = this.state;

    if (loading) {
      return <Spinner objective={true} />;
    }

    return (
      <NoHeight>
        <FilterByParams
          fields={fields}
          paramKey={paramKey}
          counts={counts}
          icon={icon}
          loading={false}
          searchable={false}
          multiple={multiple}
          treeView={treeView}
        />
      </NoHeight>
    );
  }
}
