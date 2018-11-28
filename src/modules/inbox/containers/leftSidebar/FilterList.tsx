import client from 'apolloClient';
import gql from 'graphql-tag';
import { FilterByParams, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { generateParams } from 'modules/inbox/utils';
import * as React from 'react';

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

export default class FilterGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    let loading = true;

    if (props.fields) {
      loading = false;
    }

    this.state = {
      fields: props.fields || [],
      counts: {},
      loading
    };
  }

  doQuery() {
    const { query, counts, queryParams } = this.props;

    // Fetching filter lists channels, brands, tags etc
    if (query) {
      const { queryName, dataName, variables = {} } = query;

      client
        .query({
          query: gql(queries[queryName]),
          variables
        })
        .then(({ data }) => {
          this.setState({ fields: data[dataName] });
        });
    }

    // Fetching count query
    client
      .query({
        query: gql(queries.conversationCounts),
        variables: { ...generateParams({ ...queryParams }), only: counts }
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        this.setState({ counts: data.conversationCounts[counts], loading });
      });
  }

  componentDidMount() {
    this.doQuery();
  }

  render() {
    const { paramKey, icon } = this.props;
    const { counts, fields, loading } = this.state;

    if (loading) {
      return <Spinner objective={true} />;
    }

    return (
      <FilterByParams
        fields={fields}
        paramKey={paramKey}
        counts={counts}
        icon={icon}
        loading={false}
        searchable={false}
      />
    );
  }
}
