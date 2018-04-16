import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { withApollo } from 'react-apollo';
import { Icon, Spinner } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { PopoverButton } from '../../styles';
import { queries } from '../../graphql';
import { generateParams } from '../../utils';
import { LoaderWrapper } from './styles';

const propTypes = {
  history: PropTypes.object.isRequired,
  client: PropTypes.object
};

class StatusFilterPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counts: {},
      loading: true
    };

    this.clearStatusFilter = this.clearStatusFilter.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderPopover = this.renderPopover.bind(this);
    this.renderSingleFilter = this.renderSingleFilter.bind(this);
  }

  onClick() {
    const { client } = this.props;

    client
      .query({
        query: gql(queries.conversationCounts),
        variables: queryParams => {
          generateParams(queryParams);
        }
      })
      .then(({ data, loading }) => {
        this.setState({ counts: data.conversationCounts, loading });
      });
  }

  clearStatusFilter() {
    router.setParams(this.props.history, {
      participating: '',
      status: '',
      unassigned: '',
      starred: ''
    });
  }

  renderSingleFilter(paramName, paramValue, countName, text, count) {
    const { history } = this.props;
    const { __ } = this.context;

    const onClick = () => {
      // clear previous values
      this.clearStatusFilter();
      router.setParams(history, { [paramName]: paramValue });
    };

    return (
      <li>
        <a
          className={
            router.getParam(history, [paramName]) === paramValue ? 'active' : ''
          }
          onClick={onClick}
        >
          {__(text)}
          <SidebarCounter>{count}</SidebarCounter>
        </a>
      </li>
    );
  }

  renderPopover() {
    const { loading, counts } = this.state;
    const { __ } = this.context;

    if (loading) {
      return (
        <Popover id="filter-popover" title={__('Filter by status')}>
          <LoaderWrapper>
            <Spinner />
          </LoaderWrapper>
        </Popover>
      );
    }

    return (
      <Popover id="filter-popover" title={__('Filter by status')}>
        <SidebarList>
          {this.renderSingleFilter(
            'unassigned',
            'true',
            'unassiged',
            'Unassigned',
            counts.unassigned
          )}
          {this.renderSingleFilter(
            'participating',
            'true',
            'participating',
            'Participating',
            counts.participating
          )}

          {this.renderSingleFilter(
            'status',
            'closed',
            'resolved',
            'Resolved',
            counts.resolved
          )}
        </SidebarList>
      </Popover>
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        rootClose
      >
        <PopoverButton onClick={() => this.onClick()}>
          {__('Status')}
          <Icon erxes icon="downarrow" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

StatusFilterPopover.propTypes = propTypes;
StatusFilterPopover.contextTypes = {
  __: PropTypes.func
};

export default withApollo(withRouter(StatusFilterPopover));
