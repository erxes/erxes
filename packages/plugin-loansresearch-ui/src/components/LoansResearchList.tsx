import { Alert, __ } from '@erxes/ui/src/utils';
import React from 'react';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
} from '@erxes/ui/src/components';
import { FlexRow, Title } from '@erxes/ui-settings/src/styles';
import { confirm } from '@erxes/ui/src/utils';

import { ILoanResearch } from '../types';
import LoansResearchRow from './LoansResearchRow';
import LoansResearchForm from '../containers/LoansResearchForm';

type Props = {
  queryParams: any;
  loading: boolean;
  totalCount: number;
  loanResearches: ILoanResearch[];
  isAllSelected: boolean;
  toggleBulk: () => void;
  toggleAll: (targets: ILoanResearch[], containerId: string) => void;
  bulk: any[];
};

const LoansResearchList = (props: Props) => {
  const {
    loanResearches,
    totalCount,
    loading,
    queryParams,
    isAllSelected,
    toggleAll,
    toggleBulk,
    bulk,
  } = props;

  const onChange = () => {
    toggleAll(loanResearches, 'loanResearches');
  };

  const loanForm = (formProps) => {
    return <LoansResearchForm {...formProps} queryParams={queryParams} />;
  };

  const renderActionBarRight = () => {
    const addTrigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add car
      </Button>
    );

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            // removeCars(bulk);
          })
          .catch((error) => {
            Alert.error(error.message);
          });

      return (
        <>
          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            Delete
          </Button>
        </>
      );
    }

    return (
      <BarItems>
        <ModalTrigger
          title={__('New Loans Research')}
          trigger={addTrigger}
          autoOpenKey="showLoansResearchModal"
          size="lg"
          content={loanForm}
          backDrop="static"
        />
      </BarItems>
    );
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{__(`Loan Research (${totalCount})`)}</Title>;

    const actionBarRight = <FlexRow>{renderActionBarRight()}</FlexRow>;

    return <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />;
  };

  const mainContent = (
    <Table $whiteSpace="nowrap" $hover={true}>
      <thead>
        <tr>
          <th>
            <FormControl
              checked={isAllSelected}
              componentclass="checkbox"
              onChange={onChange}
            />
          </th>
          <th>
            <SortHandler sortField={'dealId'} label={__('dealId')} />
          </th>
        </tr>
      </thead>
      <tbody id="loanResearches">
        {loanResearches.map((loanResearch) => (
          <LoansResearchRow
            loanResearch={loanResearch}
            isChecked={bulk.includes(loanResearch)}
            key={loanResearch._id}
            toggleBulk={toggleBulk}
          />
        ))}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Loans Research')}
          breadcrumb={[{ title: 'Loans Research' }]}
          queryParams={queryParams}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={loanResearches.length}
          emptyImage="/images/actions/1.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default LoansResearchList;
