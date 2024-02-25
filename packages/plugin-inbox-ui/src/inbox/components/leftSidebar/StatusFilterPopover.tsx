import { Alert, __, router } from 'coreui/utils';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { PopoverButton, PopoverHeader } from '@erxes/ui/src/styles/eindex';
import { useLocation, useNavigate } from 'react-router-dom';

import Icon from '@erxes/ui/src/components/Icon';
import { Popover } from '@headlessui/react';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import client from '@erxes/ui/src/apolloClient';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';

type Props = {
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
      loading: true,
    };
  }

  fetchData = (ignoreCache = false) => {
    const { queryParams } = this.props;

    client
      .query({
        query: gql(queries.conversationCounts),
        variables: generateParams(queryParams),
        fetchPolicy: ignoreCache ? 'network-only' : 'cache-first',
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        this.setState({ counts: data.conversationCounts, loading });
      })
      .catch((e) => {
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
    const location = useLocation();
    const navigate = useNavigate();

    router.setParams(navigate, location, {
      participating: '',
      status: '',
      unassigned: '',
      starred: '',
      awaitingResponse: '',
    });
  };

  renderSingleFilter = (
    paramName: string,
    paramValue: string,
    text: string,
    count: number,
  ) => {
    const onClick = () => {
      const location = useLocation();
      const navigate = useNavigate();

      // clear previous values
      this.clearStatusFilter();
      router.setParams(navigate, location, { [paramName]: paramValue });
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
        <div id="filter-popover">
          <PopoverHeader>{__('Filter by status')}</PopoverHeader>
          <div>
            <Spinner objective={true} />
          </div>
        </div>
      );
    }

    return (
      <div id="filter-popover" className="popover-body">
        <PopoverHeader>{__('Filter by status')}</PopoverHeader>
        <SidebarList>
          {this.renderSingleFilter(
            'unassigned',
            'true',
            'Unassigned',
            counts.unassigned,
          )}
          {this.renderSingleFilter(
            'participating',
            'true',
            'Participating',
            counts.participating,
          )}

          {this.renderSingleFilter(
            'awaitingResponse',
            'true',
            'Awaiting Response',
            counts.awaitingResponse,
          )}

          {this.renderSingleFilter(
            'status',
            'closed',
            'Resolved',
            counts.resolved,
          )}
        </SidebarList>
      </div>
    );
  };

  render() {
    return (
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button>
              <PopoverButton onClick={this.onClick}>
                {__('Status')}
                <Icon icon={open ? 'angle-up' : 'angle-down'} />
              </PopoverButton>
            </Popover.Button>
            <Popover.Panel>{this.renderPopover()}</Popover.Panel>
          </>
        )}
      </Popover>
    );
  }
}
