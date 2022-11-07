import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Collapse from 'react-bootstrap/Collapse';

import PaymentList from '../containers/PaymentList';
import { ByKindTotalCount } from '../types';
import PaymentEntry from './PaymentEntry';
import { CollapsibleContent, PaymentRow } from './styles';

type Props = {
  payments: any[];
  queryParams: any;
  paymentsCount?: ByKindTotalCount;
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

  renderEntry(payment, paymentsCount, queryParams) {
    const commonProp = {
      key: payment.name,
      payment,
      toggleBox: this.toggleBox,
      getClassName: this.getClassName,
      paymentsCount,
      queryParams
    };

    return <PaymentEntry {...commonProp} />;
  }

  renderList() {
    const { queryParams, paymentsCount } = this.props;
    const kind = this.state.kind || '';
    const count = (paymentsCount && paymentsCount[kind]) || 0;

    return (
      <>
        <PaymentList
          kind={kind}
          queryParams={queryParams}
          paymentsCount={count}
        />
        {this.renderPagination(count)}
      </>
    );
  }

  render() {
    const { payments, paymentsCount, queryParams } = this.props;

    const selected = payments.find(payment => payment.kind === this.state.kind);

    return (
      <>
        <PaymentRow>
          {payments.map(payment =>
            this.renderEntry(payment, paymentsCount, queryParams)
          )}
        </PaymentRow>
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
