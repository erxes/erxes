import client from 'apolloClient';
import gql from 'graphql-tag';
import { FilterByParams, Icon, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import { generateParams } from 'modules/inbox/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  query?: { queryName: string; dataName: string; variables?: any };
  fields?: any[];
  popoverTitle: string;
  buttonText: string;
  counts: string;
  paramKey: string;
  placement?: string;
  icon?: string;
  searchable?: boolean;
  queryParams?: any;
};

type State = {
  fields: any[];
  counts: any;
  loading: boolean;
};

export default class FilterPopover extends React.Component<Props, State> {
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

    this.renderPopover = this.renderPopover.bind(this);
    this.onClick = this.onClick.bind(this);
    this.update = this.update.bind(this);
  }

  // rerender component
  update() {
    this.forceUpdate();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  onClick() {
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

  renderPopover() {
    const { popoverTitle, paramKey, icon, searchable } = this.props;
    const { counts } = this.state;
    const { fields, loading } = this.state;

    if (loading) {
      return (
        <Popover id="filter-popover" title={__(popoverTitle)}>
          <Spinner objective={true} />
        </Popover>
      );
    }

    return (
      <Popover id="filter-popover" title={__(popoverTitle)}>
        <FilterByParams
          fields={fields}
          paramKey={paramKey}
          counts={counts}
          icon={icon}
          loading={false}
          searchable={searchable}
          update={this.update}
        />
      </Popover>
    );
  }

  render() {
    const { buttonText, placement = 'bottom' } = this.props;

    return (
      <OverlayTrigger
        trigger="click"
        placement={placement}
        overlay={this.renderPopover()}
        container={this}
        shouldUpdatePosition={true}
        rootClose={true}
      >
        <PopoverButton onClick={() => this.onClick()}>
          {__(buttonText)}
          <Icon icon={placement === 'top' ? 'uparrow-2' : 'downarrow'} />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}
