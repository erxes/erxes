import client from 'apolloClient';
import gql from 'graphql-tag';
import { Icon, Spinner } from 'modules/common/components';
import { __, Alert, router } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import { generateParams } from 'modules/inbox/utils';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  history: any;
  queryParams: any;
};

type State = {
  counts: any;
  loading: boolean;
};

export default class StatusFilterPopover extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      counts: {},
      loading: true
    };
  }

  onClick = () => {
    const { queryParams } = this.props;

    client
      .query({
        query: gql(queries.conversationCounts),
        variables: generateParams(queryParams)
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        this.setState({ counts: data.conversationCounts, loading });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  clearStatusFilter = () => {
    router.setParams(this.props.history, {
      participating: '',
      status: '',
      unassigned: '',
      starred: ''
    });
  };

  renderSingleFilter = (
    paramName: string,
    paramValue: string,
    countName: string,
    text: string,
    count: number
  ) => {
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
          {__(text)}
          <SidebarCounter>{count}</SidebarCounter>
        </a>
      </li>
    );
  };

  renderPopover = () => {
    const { loading, counts } = this.state;

    if (loading) {
      return (
        <Popover id="filter-popover" title={__('Filter by status')}>
          <Spinner objective={true} />
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
  };

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        rootClose={true}
      >
        <PopoverButton onClick={this.onClick}>
          {__('Status')}
          <Icon icon="downarrow" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}
