import Pagination from 'modules/common/components/pagination/Pagination';
import IntegrationList from 'modules/settings/integrations/containers/common/IntegrationList';
import MessengerAppList from 'modules/settings/integrations/containers/MessengerAppList';
import React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import StoreEntry from '../../containers/StoreEntry';
import { ByKindTotalCount } from '../../types';
import Entry from './Entry';
import { CollapsibleContent, IntegrationRow } from './styles';

type Props = {
  integrations: any[];
  totalCount: ByKindTotalCount;
  queryParams: any;
  customLink: (kind: string, addLink: string) => void;
};

type State = {
  isContentVisible: boolean;
  kind: string | null;
};

class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      queryParams: { kind }
    } = props;

    this.state = {
      isContentVisible: Boolean(kind) || false,
      kind
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
    if (!selectedKind || selectedKind === 'amazon-ses') {
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
    if (kind === 'lead' || kind === 'knowledgebase' || kind === 'website') {
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

    return <Entry {...commonProp} customLink={this.props.customLink} />;
  }

  renderList() {
    const { queryParams, totalCount } = this.props;
    const { kind } = this.state;

    if (this.isMessengerApp(kind)) {
      return <MessengerAppList kind={kind} queryParams={queryParams} />;
    }

    return (
      <>
        <IntegrationList
          kind={kind}
          queryParams={queryParams}
          integrationsCount={totalCount[kind || '']}
        />
        {this.renderPagination(totalCount[kind || ''])}
      </>
    );
  }

  render() {
    const { integrations, totalCount, queryParams } = this.props;

    const selected = integrations.find(
      integration => integration.kind === this.state.kind
    );

    return (
      <>
        <IntegrationRow>
          {integrations.map(integration =>
            this.renderEntry(integration, totalCount, queryParams)
          )}
        </IntegrationRow>
        <Collapse
          in={this.state.isContentVisible && selected ? true : false}
          unmountOnExit={true}
        >
          <CollapsibleContent>{this.renderList()}</CollapsibleContent>
        </Collapse>
      </>
    );
  }
}

export default Row;
