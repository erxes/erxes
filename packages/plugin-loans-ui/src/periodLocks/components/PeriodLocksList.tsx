import Alert from '@erxes/ui/src/utils/Alert';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IPeriodLock } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import React, { useRef, useState } from 'react';

import PeriodLockForm from '../containers/PeriodLockForm';
import { PeriodLocksTableWrapper } from '../styles';
import PeriodLockRow from './PeriodLockRow';
import { can } from '@erxes/ui/src/utils/core';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
// import { withRouter } from 'react-router-dom';
import { menuContracts } from '../../constants';
import { router } from '@erxes/ui/src/utils/core';
import withConsumer from '../../withConsumer';

interface IProps extends IRouterProps {
  periodLocks: IPeriodLock[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IPeriodLock[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removePeriodLocks: (
    doc: { periodLockIds: string[] },
    emptyBulk: () => void,
  ) => void;
  history: any;
  queryParams: any;
  currentUser: IUser;
}

const PeriodLocksList = (props: IProps) => {
  const timerRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState(props.searchValue);
  const {
    periodLocks,
    history,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    queryParams,
    currentUser,
    toggleAll,
  } = props;

  const onChange = () => {
    toggleAll(periodLocks, 'periodLocks');
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

  const removePeriodLocks = (periodLocks) => {
    const periodLockIds: string[] = [];

    periodLocks.forEach((periodLock) => {
      periodLockIds.push(periodLock._id);
    });

    props.removePeriodLocks({ periodLockIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = (e) => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  const mainContent = (
    <PeriodLocksTableWrapper>
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
              <SortHandler sortField={'date'} label={__('Date')} />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody id="periodLocks">
          {periodLocks.map((periodLock) => (
            <PeriodLockRow
              periodLock={periodLock}
              isChecked={bulk.includes(periodLock)}
              key={periodLock._id}
              history={history}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </PeriodLocksTableWrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      {__('Add periodLock')}
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () =>
      confirm()
        .then(() => {
          removePeriodLocks(bulk);
        })
        .catch((error) => {
          Alert.error(error.message);
        });

    actionBarLeft = (
      <BarItems>
        {can('managePeriodLocks', currentUser) && (
          <Button btnStyle="danger" icon="cancel-1" onClick={onClick}>
            {__('Delete')}
          </Button>
        )}
      </BarItems>
    );
  }

  const periodLockForm = (props) => {
    return <PeriodLockForm {...props} queryParams={queryParams} />;
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
      {can('managePeriodLocks', currentUser) && (
        <ModalTrigger
          title={__('New periodLock')}
          trigger={addTrigger}
          autoOpenKey="showPeriodLockModal"
          content={periodLockForm}
          backDrop="static"
        />
      )}
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
          title={__(`Period Locks`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContracts.filter((row) =>
            can(row.permission, currentUser),
          )}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={periodLocks.length}
          emptyText="Add in your first periodLock!"
          emptyImage="/images/actions/1.svg"
        />
      }
    />
  );
};

export default withConsumer(PeriodLocksList);
