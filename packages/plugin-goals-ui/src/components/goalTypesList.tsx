import {
  Alert,
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  Table,
  Wrapper,
  __,
  confirm
} from '@erxes/ui/src';
import {
  default as GoalForm,
  default as GoalTypeForm
} from '../containers/goalForm';

import GoalRow from './goalRow';
import { GoalTypesTableWrapper } from '../styles';
import { IGoalType } from '../types';
import React from 'react';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  goalTypes: IGoalType[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  toggleBulk: () => void;
  toggleAll: (targets: IGoalType[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  remove: (doc: { goalTypeIds: string[] }, emptyBulk: () => void) => void;
  queryParams: any;
};

const goalTypesList = (props: Props) => {
  const {
    goalTypes,
    loading,
    searchValue,
    totalCount,
    toggleBulk,
    toggleAll,
    bulk,
    isAllSelected,
    emptyBulk,
    remove,
    queryParams
  } = props;

  const onChange = () => {
    toggleAll(goalTypes, 'goalTypes');
  };

  const handleRemove = () => {
    const goalTypeIds: string[] = [];
    confirm()
      .then(() => {
        bulk.forEach((goalType) => {
          goalTypeIds.push(goalType._id);
        });

        remove({ goalTypeIds }, emptyBulk);
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const renderForm = (formProps) => {
    return (
      <GoalTypeForm
        {...formProps}
        queryParams={queryParams}
      />
    );
  };

  const renderActionBarRight = () => {
    if (bulk.length > 0) {
      return (
        <Button
          btnStyle='danger'
          icon='cancel-1'
          onClick={handleRemove}>
          {__('Delete')}
        </Button>
      );
    }

    const addTrigger = (
      <Button
        btnStyle='success'
        icon='plus-circle'>
        {__('Add Goal')}
      </Button>
    );

    return (
      <ModalTrigger
        size='lg'
        title={__('New Goal')}
        trigger={addTrigger}
        autoOpenKey='showGoalTypeModal'
        content={renderForm}
        backDrop='static'
      />
    );
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{`Goals (${totalCount})`}</Title>;

    return (
      <Wrapper.ActionBar
        left={actionBarLeft}
        right={renderActionBarRight()}
      />
    );
  };

  const renderContent = () => {
    return (
      <GoalTypesTableWrapper>
        <Table
          $whiteSpace='nowrap'
          $bordered={true}
          $hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentclass='checkbox'
                  onChange={onChange}
                />
              </th>
              <th>{__('name ')}</th>
              <th>{__('entity ')}</th>
              <th>{__('boardName ')}</th>
              <th>{__('pipelineName ')}</th>
              <th>{__('stageName ')}</th>
              <th>{__('contributionType')}</th>
              <th>{__('metric')}</th>
              <th>{__('startDate')}</th>
              <th>{__('endDate')}</th>
              <th>{__('Action')}</th>
            </tr>
          </thead>
          <tbody id='goalTypes'>
            {goalTypes.map((goalType) => (
              <GoalRow
                goalType={goalType}
                isChecked={bulk.includes(goalType)}
                key={goalType._id}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>
      </GoalTypesTableWrapper>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`GoalTypes`) + ` (${totalCount})`}
          queryParams={queryParams}
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            { title: __('Goal') }
          ]}
        />
      }
      hasBorder={true}
      actionBar={renderActionBar()}
      leftSidebar={<Sidebar params={queryParams} />}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={goalTypes.length}
          emptyText={__('Add in your first goalType!')}
          emptyImage='/images/actions/1.svg'
        />
      }
    />
  );
};

export default goalTypesList;
