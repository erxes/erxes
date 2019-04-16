import { Pagination } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import MessengerAppList from 'modules/settings/integrations/containers/MessengerAppList';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
import StoreEntry from '../../containers/StoreEntry';
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

  isMessengerApp(kind: string | null) {
    if (kind === 'lead' || kind === 'googleMeet' || kind === 'knowledgebase') {
      return true;
    }

    return false;
  }

  renderEntry(integration, totalCount, queryParams) {
    const kind = integration.kind;

    const commonProp = {
      key: integration.name,
      integration,
      toggleBox: this.toggleBox,
      getClassName: this.getClassName,
      totalCount,
      queryParams
    };

    if (this.isMessengerApp(kind)) {
      return <StoreEntry {...commonProp} kind={kind} />;
    }

    return <Entry {...commonProp} />;
  }

  renderList() {
    const { queryParams, totalCount } = this.props;
    const { kind } = this.state;

    if (this.isMessengerApp(kind)) {
      return <MessengerAppList kind={kind} queryParams={queryParams} />;
    }

    return (
      <>
        <IntegrationList kind={kind} queryParams={queryParams} />
        {this.renderPagination(totalCount[kind || ''])}
      </>
    );
  }

  render() {
    const { integrations, title, totalCount, queryParams } = this.props;

    return (
      <>
        {title && <h3>{__(title)}</h3>}
        <IntegrationRow>
          {integrations.map(integration =>
            this.renderEntry(integration, totalCount, queryParams)
          )}
        </IntegrationRow>
        <Collapse in={this.state.isContentVisible} unmountOnExit={true}>
          <CollapsibleContent>{this.renderList()}</CollapsibleContent>
        </Collapse>
      </>
    );
  }
}

export default Row;
