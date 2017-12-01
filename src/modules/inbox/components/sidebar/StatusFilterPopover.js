import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Icon, Button } from 'modules/common/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { PopoverButton } from '../../styles';
import { router } from 'modules/common/utils';

const propTypes = {
  counts: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

class StatusFilterPopover extends Component {
  constructor(props) {
    super(props);

    this.clearStatusFilter = this.clearStatusFilter.bind(this);
    this.renderSingleFilter = this.renderSingleFilter.bind(this);
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
          {text}
          <SidebarCounter>{count}</SidebarCounter>
        </a>
      </li>
    );
  }

  render() {
    const { history, counts } = this.props;

    const popover = (
      <Popover id="filter-popover" title="Filter by status">
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

          {this.renderSingleFilter(
            'starred',
            'true',
            'starred',
            'Starred',
            counts.starred
          )}
        </SidebarList>
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={popover}
        container={this}
        rootClose
      >
        <PopoverButton>
          Status
          <Icon icon="ios-arrow-down" />
          {router.getParam(history, 'participating') ||
          router.getParam(history, 'unassigned') ||
          router.getParam(history, 'status') ||
          router.getParam(history, 'starred') ? (
            <Button
              btnStyle="link"
              tabIndex={0}
              onClick={this.clearStatusFilter}
            >
              <Icon icon="close-circled" />
            </Button>
          ) : null}
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

StatusFilterPopover.propTypes = propTypes;

export default withRouter(StatusFilterPopover);
