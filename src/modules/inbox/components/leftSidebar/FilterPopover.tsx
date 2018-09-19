import gql from 'graphql-tag';
import { FilterByParams, Icon, Spinner } from 'modules/common/components';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import { generateParams } from 'modules/inbox/utils';
import * as React from 'react';
import { withApollo } from 'react-apollo';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { withRouter } from 'react-router';

type Props = {
  query: string;
  fields: any[];
  popoverTitle: string;
  buttonText: string;
  counts: string;
  paramKey: string;
  placement: string;
  icon: string;
  searchable: boolean;
  client: any;
  queryParams: any;
};

type State = {
  fields: any[];
  counts: any;
  loading: boolean
};

const defaultProps = {
  placement: 'bottom'
};

class FilterPopover extends React.Component<Props, State> {
  constructor(props) {
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
    const { client, query, counts, queryParams } = this.props;

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
      .then(({ data, loading }) => {
        this.setState({ counts: data.conversationCounts[counts], loading });
      });
  }

  renderPopover() {
    const { popoverTitle, paramKey, icon, searchable } = this.props;
    const { counts } = this.state;
    const { __ } = this.context;
    const { fields, loading } = this.state;

    if (loading) {
      return (
        <Popover id="filter-popover" title={__(popoverTitle)}>
          <Spinner objective />
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
    const { buttonText, placement } = this.props;
    const { __ } = this.context;

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement={placement}
        overlay={this.renderPopover()}
        container={this}
        shouldUpdatePosition
        rootClose
      >
        <PopoverButton onClick={() => this.onClick()}>
          {__(buttonText)}
          <Icon icon={placement === 'top' ? 'uparrow-2' : 'downarrow'} />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

FilterPopover.defaultProps = defaultProps;

export default withApollo(withRouter(FilterPopover));
