import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import FilterByParams from '@erxes/ui/src/components/FilterByParams';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';
import { NoHeight } from '@erxes/ui-inbox/src/inbox/styles';
import Button from '@erxes/ui/src/components/Button';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
import React from 'react';

type Props = {
  query?: { queryName: string; dataName: string; variables?: any };
  fields?: any[];
  totalCount: number;
  counts: string;
  paramKey: string;
  icon?: string;
  queryParams?: any;
  refetchRequired: string;
  multiple?: boolean;
  treeView?: boolean;
  setCounts?: (counts: any) => void;
};

type State = {
  fields: any[];
  counts: any;
  limit: number;
  loading: boolean;
  loadMore: boolean;
};

export default class FilterList extends React.PureComponent<Props, State> {
  mounted: boolean;

  private abortController;

  constructor(props: Props) {
    super(props);

    this.abortController = new AbortController();

    let loading = true;

    if (props.fields) {
      loading = false;
    }

    this.mounted = false;

    this.state = {
      fields: props.fields || [],
      counts: {},
      limit: 10,
      loadMore: false,
      loading
    };
  }

  fetchData(ignoreCache = false) {
    const { query, counts, queryParams, setCounts, totalCount } = this.props;

    if (this.state.loadMore) {
      this.setState({ limit: this.state.limit + 10 });
    }

    this.mounted = true;

    // Fetching filter lists channels, brands, tags etc
    if (query) {
      let { queryName, dataName, variables = {} } = query;

      variables = {
        ...variables,
        perPage: this.state.limit + (this.state.loadMore ? 10 : 0)
      };

      client
        .query({
          query: gql(queries[queryName]),
          variables
        })
        .then(({ data, loading }: any) => {
          if (this.mounted) {
            this.setState({ fields: data[dataName], loading });
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
        // context: {
        //   fetchOptions: { signal: this.abortController.signal }
        // }
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        if (this.mounted) {
          this.setState({ counts: data.conversationCounts[counts], loading });

          if (setCounts) {
            setCounts({ [counts]: data.conversationCounts[counts] });
          }
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  componentDidMount() {
    this.setState({ loadMore: true });
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.abortController.abort();
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
    const { paramKey, icon, multiple, treeView, totalCount } = this.props;
    const { counts, fields, loading } = this.state;

    const onLoadMore = () => {
      this.componentDidMount();
    };

    const renderLoadMore = () => {
      if (fields.length >= totalCount) {
        this.setState({ loadMore: false });
        return null;
      }

      return (
        <Button
          block={true}
          btnStyle="link"
          onClick={onLoadMore}
          icon="redo"
          uppercase={false}
        >
          {loading ? 'Loading...' : 'Load more'}
        </Button>
      );
    };

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
        {renderLoadMore()}
      </NoHeight>
    );
  }
}
