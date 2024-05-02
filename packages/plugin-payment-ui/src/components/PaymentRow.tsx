import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React, { useState } from 'react';
import Collapse from '@erxes/ui/src/components/Collapse';

import PaymentList from '../containers/PaymentList';
import { ByKindTotalCount } from '../types';
import PaymentEntry from './PaymentEntry';
import { CollapsibleContent, PaymentRow } from './styles';

type Props = {
  payments: any[];
  queryParams: any;
  paymentsCount?: ByKindTotalCount;
};

const Row: React.FC<Props> = (props) => {
  const { payments, paymentsCount, queryParams } = props;

  const [state, setState] = useState({
    isContentVisible: Boolean(queryParams.kind) || false,
    kind: queryParams.kind,
  });

  const getClassName = (type) => {
    const { kind, isContentVisible } = state;

    if (!isContentVisible) {
      return '';
    }

    if (type === kind) {
      return 'active';
    }

    return '';
  };

  const toggleBox = (selectedKind: string, isAvailable?: boolean) => {
    if (isAvailable && !isAvailable) {
      return null;
    }

    const { isContentVisible, kind } = state;

    setState((prevState) => {
      if (
        prevState.kind === selectedKind ||
        kind === null ||
        !isContentVisible
      ) {
        return { isContentVisible: !isContentVisible, kind: selectedKind };
      }

      return {
        kind: selectedKind,
        isContentVisible: prevState.isContentVisible,
      };
    });

    return null;
  };

  const renderPagination = (totalCount) => {
    if (!totalCount || totalCount <= 20) {
      return null;
    }

    return <Pagination count={totalCount} />;
  };

  const renderEntry = (payment, paymentsCount, queryParams) => {
    const commonProp = {
      key: payment.name,
      payment,
      toggleBox: toggleBox,
      getClassName: getClassName,
      paymentsCount,
      queryParams,
    };

    return <PaymentEntry {...commonProp} />;
  };

  const renderList = () => {
    const { queryParams, paymentsCount } = props;
    const kind = state.kind || '';
    const count = (paymentsCount && paymentsCount[kind]) || 0;

    return (
      <>
        <PaymentList
          kind={kind}
          queryParams={queryParams}
          paymentsCount={count}
        />
        {renderPagination(count)}
      </>
    );
  };

  const selected = payments.find((payment) => payment.kind === state.kind);

  return (
    <>
      <PaymentRow>
        {payments.map((payment) =>
          renderEntry(payment, paymentsCount, queryParams),
        )}
      </PaymentRow>
      <Collapse
        show={state.isContentVisible && selected ? true : false}
        unmount={true}
      >
        <CollapsibleContent>{renderList()}</CollapsibleContent>
      </Collapse>
    </>
  );
};

export default Row;
