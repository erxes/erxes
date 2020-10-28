import client from 'apolloClient';
import gql from 'graphql-tag';
import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import { __, Alert, router } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { PopoverButton } from 'modules/inbox/styles';
import { generateParams } from 'modules/inbox/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

type Props = {
  history: any;
  queryParams: any;
  refetchRequired: string;
};

type State = {
  counts: any;
  loading: boolean;
};

export default class StatusFilterPopover extends React.Component<Props, State> {
  private overlayTrigger;

  constructor(props) {
    super(props);

    this.state = {
      counts: {},
      loading: true
    };
  }

  fetchData = (ignoreCache = false) => {
    const { queryParams } = this.props;

    client
      .query({
        query: gql(queries.conversationCounts),
        variables: generateParams(queryParams),
        fetchPolicy: ignoreCache ? 'network-only' : 'cache-first'
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        this.setState({ counts: data.conversationCounts, loading });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  componentDidUpdate(prevProps) {
    if (this.props.refetchRequired !== prevProps.refetchRequired) {
      this.fetchData(true);
    }
  }

  onClick = () => {
    this.fetchData();
  };

  clearStatusFilter = () => {
    router.setParams(this.props.history, {
      participating: '',
      status: '',
      unassigned: '',
      starred: '',
      awaitingResponse: ''
    });
  };

  renderSingleFilter = (
    paramName: string,
    paramValue: string,
    text: string,
    count: number
  ) => {
    const { history } = this.props;

    const onClick = () => {
      // clear previous values
      this.clearStatusFilter();
      router.setParams(history, { [paramName]: paramValue });
      this.overlayTrigger.hide();
    };

    return (
      <li>
        <a
          href="#link"
          className={
            router.getParam(history, [paramName]) === paramValue ? 'active' : ''
          }
          onClick={onClick}
        >
          <FieldStyle>{__(text)}</FieldStyle>
          <SidebarCounter>{count}</SidebarCounter>
        </a>
      </li>
    );
  };

  renderPopover = () => {
    const { loading, counts } = this.state;

    if (loading) {
      return (
        <Popover id="filter-popover">
          <Popover.Title as="h3">{__('Filter by status')}</Popover.Title>
          <Popover.Content>
            <Spinner objective={true} />
          </Popover.Content>
        </Popover>
      );
    }

    return (
      <Popover id="filter-popover">
        <Popover.Title as="h3">{__('Filter by status')}</Popover.Title>
        <Popover.Content>
          <SidebarList>
            {this.renderSingleFilter(
              'unassigned',
              'true',
              'Unassigned',
              counts.unassigned
            )}
            {this.renderSingleFilter(
              'participating',
              'true',
              'Participating',
              counts.participating
            )}

            {this.renderSingleFilter(
              'awaitingResponse',
              'true',
              'Awaiting Response',
              counts.awaitingResponse
            )}

            {this.renderSingleFilter(
              'status',
              'closed',
              'Resolved',
              counts.resolved
            )}
          </SidebarList>
        </Popover.Content>
      </Popover>
    );
  };

  render() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        rootClose={true}
      >
        <PopoverButton onClick={this.onClick}>
          {__('Status')}
          <Icon icon="angle-down" />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}
