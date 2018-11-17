import client from 'apolloClient';
import gql from 'graphql-tag';
import { FilterByParams, Icon, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { generateParams } from 'modules/inbox/utils';
import * as React from 'react';
import { GroupTitle } from './styles';

type Props = {
  query?: { queryName: string; dataName: string; variables?: any };
  fields?: any[];
  groupText: string;
  counts: string;
  paramKey: string;
  icon?: string;
  queryParams?: any;
};

type State = {
  fields: any[];
  counts: any;
  loading: boolean;
  isOpen: boolean;
};

export default class FilterPopover extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let loading = true;

    if (props.fields) {
      loading = false;
    }

    this.state = {
      isOpen: false,
      fields: props.fields || [],
      counts: {},
      loading
    };
  }

  // rerender component
  update = () => {
    this.forceUpdate();
  };

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
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
    if (this.state.isOpen) {
      this.doQuery();
    }
  }

  onClick = () => {
    if (!this.state.isOpen) {
      this.doQuery();
    }

    this.setState({ isOpen: !this.state.isOpen });
  };

  renderPopover = () => {
    const { paramKey, icon } = this.props;
    const { counts } = this.state;
    const { fields, loading } = this.state;

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
        update={this.update}
      />
    );
  };

  render() {
    const { groupText } = this.props;

    return (
      <>
        <GroupTitle onClick={this.onClick}>
          {__(groupText)}
          <Icon icon="downarrow" />
        </GroupTitle>
        {this.state.isOpen && this.renderPopover()}
      </>
    );
  }
}
