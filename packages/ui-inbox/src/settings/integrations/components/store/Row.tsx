import { CollapsibleContent, IntegrationRow } from './styles';

import { ByKindTotalCount } from '../../types';
import Collapse from '@erxes/ui/src/components/Collapse';
import Entry from './Entry';
import IntegrationList from '../../containers/common/IntegrationList';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';

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

  toggleBox = (selectedKind: string, isAvailable?: boolean) => {
    if (isAvailable && !isAvailable) return null;

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

  renderEntry(integration, totalCount, queryParams) {
    const commonProp = {
      key: integration.name,
      integration,
      toggleBox: this.toggleBox,
      getClassName: this.getClassName,
      totalCount,
      queryParams
    };

    return <Entry {...commonProp} customLink={this.props.customLink} />;
  }

  renderList() {
    const { queryParams, totalCount } = this.props;
    const { kind } = this.state;

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
          show={!!(this.state.isContentVisible && selected)}
          unmount={true}
        >
          <CollapsibleContent>{this.renderList()}</CollapsibleContent>
        </Collapse>
      </>
    );
  }
}

export default Row;
