import React, { useState } from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import { FormControl } from '@erxes/ui/src/components';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { IReport } from '../types';
import Row from './Row';

type Props = {
  reports: IReport[];
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  removeReports?: (reportIds: string[]) => void;
  editReport?: (report: IReport) => void;
  loading: boolean;
  history: any;
};

function List(props: Props) {
  const { reports, loading, history } = props;
  const [searchValue, setSearchvalue] = useState(null);
  const [chosenIds, setChosenIds] = useState<any>([]);

  let timer: NodeJS.Timer;

  const search = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const value = e.target.value;
    setSearchvalue(value);

    timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue: value });
    }, 500);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };
  const title = <Title capitalize={true}>{__('Reports')}</Title>;

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Search a report')}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />

      <Button
        btnStyle="success"
        size="small"
        icon="plus-circle"
        onClick={() => history.push('/reports/details/create-report')}
      >
        {__('Create a report')}
      </Button>
    </BarItems>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} wideSpacing />;

  const toggleReport = (reportId: string, isChecked: boolean) => {
    if (isChecked) {
      setChosenIds([...chosenIds, reportId]);
    } else {
      setChosenIds(chosenIds.filter(id => id !== reportId));
    }
  };

  const updatedProps = {
    ...props,
    toggleReport
  };
  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('')}</th>
          <th>{__('Name')}</th>
          <th>{__('Last updated by')}</th>
          <th>{__('Created by')}</th>
          <th>{__('Last updated at')}</th>
          <th>{__('Created at')}</th>
          <th>{__('Tags')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {reports.map(report => {
          return (
            <Row
              key={report._id}
              report={report}
              {...updatedProps}
              isChecked={chosenIds.includes(report._id)}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(/* webpackChunkName: "List - Reports" */ '../containers/SideBarList')
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Reports'), link: '/reports' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Reports')} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={reports.length}
          emptyText={__('There are no reports')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder
    />
  );
}

export default List;
