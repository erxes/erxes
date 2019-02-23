import { Pagination } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import MessengerAppList from 'modules/settings/integrations/containers/MessengerAppList';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
import Entry from './Entry';
import { CollapsibleContent, IntegrationRow } from './styles';

type Props = {
  integrations: any[];
  title?: string;
  totalCount: {
    messenger: number;
    form: number;
    twitter: number;
    facebook: number;
    gmail: number;
  };
  messengerAppsCount: number;
  queryParams: any;
};

type State = {
  isContentVisible: boolean;
  kind: string | null;
};

class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isContentVisible: false,
      kind: null
    };
  }

  getClassName = selectedKind => {
    const { kind, isContentVisible } = this.state;

    if (!isContentVisible) {
      return '';
    }

    if (selectedKind === kind) {
      return 'active';
    }

    return '';
  };

  toggleBox = selectedKind => {
    if (!selectedKind) {
      return false;
    }

    const { isContentVisible, kind } = this.state;

    this.setState(prevState => {
      if (
        prevState.kind === selectedKind ||
        kind === null ||
        !isContentVisible
      ) {
        return { isContentVisible: !isContentVisible, kind: selectedKind };
      }

      return {
        kind: selectedKind,
        isContentVisible: prevState.isContentVisible
      };
    });

    return null;
  };

  renderPagination(totalCount) {
    if (!totalCount || totalCount <= 20) {
      return null;
    }

    return <Pagination count={totalCount} />;
  }

  renderList() {
    const { queryParams, totalCount } = this.props;
    const { isContentVisible, kind } = this.state;

    if (!isContentVisible) {
      return null;
    }

    if (kind === 'googleMeet' || kind === 'lead' || kind === 'knowledgebase') {
      return <MessengerAppList kind={kind} queryParams={queryParams} />;
    }

    return (
      <React.Fragment>
        <IntegrationList kind={kind} queryParams={queryParams} />
        {this.renderPagination(totalCount[kind || ''])}
      </React.Fragment>
    );
  }

  render() {
    const { integrations, title, totalCount, messengerAppsCount } = this.props;

    return (
      <React.Fragment>
        {title && <h3>{__(title)}</h3>}
        <IntegrationRow>
          {integrations.map(integration => (
            <Entry
              key={integration.name}
              integration={integration}
              toggleBox={this.toggleBox}
              getClassName={this.getClassName}
              totalCount={totalCount}
              messengerAppsCount={messengerAppsCount}
            />
          ))}
        </IntegrationRow>
        <Collapse in={this.state.isContentVisible}>
          <CollapsibleContent>{this.renderList()}</CollapsibleContent>
        </Collapse>
      </React.Fragment>
    );
  }
}

export default Row;
