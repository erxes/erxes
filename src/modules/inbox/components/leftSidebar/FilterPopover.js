import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FilterByParams, Icon, Spinner } from 'modules/common/components';
import { queries } from 'modules/inbox/graphql';
import { generateParams } from 'modules/inbox/utils';
import { PopoverButton } from 'modules/inbox/styles';

const propTypes = {
  query: PropTypes.object,
  fields: PropTypes.array,
  popoverTitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  counts: PropTypes.string,
  paramKey: PropTypes.string.isRequired,
  placement: PropTypes.string,
  icon: PropTypes.string,
  searchable: PropTypes.bool,
  client: PropTypes.object,
  queryParams: PropTypes.object
};

const defaultProps = {
  placement: 'bottom'
};

class FilterPopover extends Component {
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

FilterPopover.propTypes = propTypes;
FilterPopover.defaultProps = defaultProps;
FilterPopover.contextTypes = {
  __: PropTypes.func
};

export default withApollo(withRouter(FilterPopover));
