import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Wrapper } from '@erxes/ui/src/layout';
import {
  DataWithLoader,
  FormControl,
  Pagination,
  SortHandler,
  Table,
} from '@erxes/ui/src/components';
import { ILoanResearch } from '../types';
import LoansResearchRow from './LoansResearchRow';

type Props = {
  queryParams: any;
  loading: boolean;
  totalCount: number;
  loanResearch: ILoanResearch[];
  isAllSelected: boolean;
  toggleBulk: () => void;
  toggleAll: (targets: ILoanResearch[], containerId: string) => void;
  bulk: any[];
};

const LoansResearchList = ({
  loanResearch,
  totalCount,
  loading,
  queryParams,
  isAllSelected,
  toggleAll,
  toggleBulk,
  bulk,
}: Props) => {
  const onChange = () => {
    toggleAll(loanResearch, 'loanResearch');
  };

  const mainContent = (
    <Table $whiteSpace="nowrap" $bordered={true} $hover={true} $striped={true}>
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
            <SortHandler sortField={'apiUrl'} label={__('apiUrl')} />
          </th>
        </tr>
      </thead>
      <tbody id="loansResearch">
        {loanResearch.map((loanResearch) => (
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
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={loanResearch.length}
          emptyImage="/images/actions/1.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default LoansResearchList;
