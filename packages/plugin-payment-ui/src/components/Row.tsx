import { CollapsibleContent, IntegrationRow } from './styles';

import Collapse from 'react-bootstrap/Collapse';
import Entry from './Entry';
import IntegrationList from '../containers/IntegrationList';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import { IPaymentTypeCount } from 'types';

type Props = {
  integrations: any[];
  queryParams: any;
  paymentConfigsCount?: IPaymentTypeCount;
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

    console.log('Home row ...', this.props.paymentConfigsCount);
  }

  getClassName = type => {
    const { kind, isContentVisible } = this.state;

    if (!isContentVisible) {
      return '';
    }

    if (type === kind) {
      return 'active';
    }

    return '';
  };

  toggleBox = (selectedKind: string, isAvailable?: boolean) => {
    if (isAvailable && !isAvailable) {
      return null;
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

  renderEntry(integration, paymentConfigsCount, queryParams) {
    const commonProp = {
      key: integration.name,
      integration,
      toggleBox: this.toggleBox,
      getClassName: this.getClassName,
      paymentConfigsCount,
      queryParams
    };

    return <Entry {...commonProp} />;
  }

  renderList() {
    const { queryParams, paymentConfigsCount } = this.props;
    const { kind } = this.state;

    return (
      <>
        <IntegrationList
          type={kind}
          queryParams={queryParams}
          integrationsCount={
            paymentConfigsCount ? paymentConfigsCount.total : 0
          }
        />
        {this.renderPagination(
          paymentConfigsCount ? paymentConfigsCount.total : 0
        )}
      </>
    );
  }

  render() {
    console.log('render on Row');

    const { integrations, paymentConfigsCount, queryParams } = this.props;

    const selected = integrations.find(
      integration => integration.type === this.state.kind
    );

    return (
      <>
        <IntegrationRow>
          {integrations.map(integration =>
            this.renderEntry(integration, paymentConfigsCount, queryParams)
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
