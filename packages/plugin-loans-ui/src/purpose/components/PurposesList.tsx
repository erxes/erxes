import React, { useState } from 'react';

import Alert from '@erxes/ui/src/utils/Alert';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import PurposeForm from '../containers/PurposeForm';
import PurposesRow from './PurposesRow';
import { ContractTypesTableWrapper } from '../styles';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IPurpose } from '../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { useNavigate } from 'react-router-dom';

interface IProps {
  purposes: IPurpose[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IPurpose[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removePurpose: (doc: { purposeIds: string[] }, emptyBulk: () => void) => void;
  queryParams: any;
}

const ContractTypesList = (props: IProps) => {
  const timerRef = React.useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState(props.searchValue);

  const {
    purposes,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    toggleAll,
  } = props;

  const navigate = useNavigate();

  const onChange = () => {
    toggleAll(purposes, 'purposes');
  };

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;

    setSearchValue(value);

    timerRef.current = window.setTimeout(() => {
      navigate(`/erxes-plugin-loan/purpose?searchValue=${value}`);
    }, 500);
  };

  const removePurposes = (purposes) => {
    const purposeIds: string[] = [];

    purposes.forEach((purpose) => {
      purposeIds.push(purpose._id);
    });

    props.removePurpose({ purposeIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  const mainContent = (
    <ContractTypesTableWrapper>
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $striped={true}
      >
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>{__('Code')}</th>
            <th>{__('Name')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="purposes">
          {purposes.map((purpose) => (
            <PurposesRow
              purpose={purpose}
              purposes={purposes}
              isChecked={bulk?.includes(purpose)}
              key={purpose._id}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </ContractTypesTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__('Add purpose')}
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removePurposes(bulk);
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

  const purposeForm = (props) => {
    return (
      <PurposeForm {...props} queryParams={queryParams} purposes={purposes} />
    );
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
        title={__('New purpose')}
        size="xl"
        trigger={addTrigger}
        autoOpenKey="showContractTypeModal"
        content={purposeForm}
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
          count={purposes.length}
          emptyText={__('Add in your first purpose!')}
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default ContractTypesList;
