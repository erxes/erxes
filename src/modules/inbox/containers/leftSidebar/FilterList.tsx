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

  fetchData() {
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
        .then(({ data }) => {
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
        variables: { ...generateParams({ ...queryParams }), only: counts }
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

  render() {
    const { paramKey, icon } = this.props;
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
        />
      </NoHeight>
    );
  }
}
