import {
  Alert,
  BarItems,
  Button,
  confirm,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  router,
  SortHandler,
  Table,
  Wrapper
} from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuContracts } from '../../constants';

import { ClassificationHistoryTableWrapper } from '../styles';
import { IPeriodLock } from '../types';
import PeriodLockRow from './ClassificationHistoryRow';
import { can } from '@erxes/ui/src/utils/core';
import withConsumer from '../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';

interface IProps extends IRouterProps {
  classificationHistory: IPeriodLock[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IPeriodLock[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeClassificationHistory: (
    doc: { classificationIds: string[] },
    emptyBulk: () => void
  ) => void;
  history: any;
  queryParams: any;
  currentUser: IUser;
}

type State = {
  searchValue?: string;
};

class ClassificationHistoryList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, classificationHistory } = this.props;
    toggleAll(classificationHistory, 'classificationHistory');
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });
    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  removeClassificationHistory = classificationHistory => {
    const classificationIds: string[] = [];

    classificationHistory.forEach(periodLock => {
      classificationIds.push(periodLock._id);
    });

    this.props.removeClassificationHistory(
      { classificationIds },
      this.props.emptyBulk
    );
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      classificationHistory,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentUser
    } = this.props;

    const mainContent = (
      <ClassificationHistoryTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>
                <SortHandler sortField={'date'} label={__('Date')} />
              </th>
              <th>
                <SortHandler sortField={'total'} label={__('Total')} />
              </th>
              <th>
                <SortHandler sortField={'total'} label={__('Classification')} />
              </th>
              <th>
                <SortHandler
                  sortField={'total'}
                  label={__('New Classification')}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody id="classificationHistory">
            {classificationHistory.map(periodLock => (
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
      </ClassificationHistoryTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        {__('Add periodLock')}
      </Button>
    );

    let actionBarLeft: React.ReactNode;

    if (bulk.length > 0) {
      const onClick = () =>
        confirm()
          .then(() => {
            this.removeClassificationHistory(bulk);
          })
          .catch(error => {
            Alert.error(error.message);
          });

      actionBarLeft = (
        <BarItems>
          {can('manageClassificationHistory', currentUser) && (
            <Button
              btnStyle="danger"
              size="small"
              icon="cancel-1"
              onClick={onClick}
            >
              {__('Delete')}
            </Button>
          )}
        </BarItems>
      );
    }

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Period Locks`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={menuContracts.filter(row =>
              can(row.permission, currentUser)
            )}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={classificationHistory.length}
            emptyText="Add in your first periodLock!"
            emptyImage="/images/actions/1.svg"
          />
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(
  withConsumer(ClassificationHistoryList)
);
