import Alert from '@erxes/ui/src/utils/Alert';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import ContractTypeForm from '../containers/ContractTypeForm';
import ContractTypeRow from './ContractTypeRow';
import { ContractTypesTableWrapper } from '../styles';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IContractType } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import React, { useRef, useState } from 'react';
// import { withRouter } from 'react-router-dom';

import { __ } from 'coreui/utils';
interface IProps extends IRouterProps {
  contractTypes: IContractType[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IContractType[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeContractTypes: (
    doc: { contractTypeIds: string[] },
    emptyBulk: () => void,
  ) => void;
  history: any;
  queryParams: any;
}

const ContractTypesList = (props: IProps) => {
  const timerRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState(props.searchValue);

  const {
    contractTypes,
    history,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    toggleAll,
  } = props;

  const onChange = () => {
    toggleAll(contractTypes, 'contractTypes');
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { history } = props;
    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = setTimeout(() => {
      history.push(`/settings/contract-types?searchValue=${value}`);
    }, 500);
  };

  const removeContractTypes = (contractTypes) => {
    const contractTypeIds: string[] = [];

    contractTypes.forEach((contractType) => {
      contractTypeIds.push(contractType._id);
    });

    props.removeContractTypes({ contractTypeIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  const mainContent = (
    <ContractTypesTableWrapper>
      <Table whiteSpace="nowrap" bordered={true} hover={true} striped>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>
              <SortHandler sortField={'code'} label={__('Code')} />
            </th>
            <th>
              <SortHandler sortField={'name'} label={__('Name')} />
            </th>
            <th>
              <SortHandler sortField={'number'} label={__('Start Number')} />
            </th>
            <th>{__('After vacancy count')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="contractTypes">
          {contractTypes.map((contractType) => (
            <ContractTypeRow
              contractType={contractType}
              isChecked={bulk.includes(contractType)}
              key={contractType._id}
              history={history}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </ContractTypesTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__('Add contractType')}
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removeContractTypes(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarLeft = (
      <BarItems>
        <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
          {__('Delete')}
        </Button>
      </BarItems>
    );
  }

  const contractTypeForm = (props) => {
    return <ContractTypeForm {...props} queryParams={queryParams} />;
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Type to search')}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />

      <ModalTrigger
        title="New contractType"
        size="lg"
        trigger={addTrigger}
        autoOpenKey="showContractTypeModal"
        content={contractTypeForm}
        backDrop="static"
      />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  return (
    <Wrapper
      hasBorder
      header={
        <Wrapper.Header
          title={__(`ContractTypes`) + ` (${totalCount})`}
          queryParams={queryParams}
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            { title: __('Contract Type') },
          ]}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={contractTypes.length}
          emptyText="Add in your first contractType!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default ContractTypesList;
