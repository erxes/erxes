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

type Props = {
  reports: any;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  removeReports?: (reportIds: string[]) => void;
  editReport?: (report: IReport) => void;
  loading: boolean;
  history: any;
};

function List(props: Props) {
  const { reports, renderButton, loading, history } = props;
  const [searchValue, setSearchvalue] = useState(null);
  let timer: NodeJS.Timer;

  const trigger = (
    <Button id={'AddReportsButton'} btnStyle="success" icon="plus-circle">
      Add Reports
    </Button>
  );

  // const modalContent = props => (
  //   <Form
  //     {...props}
  //     types={types}
  //     renderButton={renderButton}
  //     reports={reports}
  //   />
  // );

  // const actionBarRight = (
  //   <ModalTrigger
  //     title={__('Add reports')}
  //     trigger={trigger}
  //     content={modalContent}
  //     enforceFocus={false}
  //   />
  // );

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

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Todo')}</th>
          <th>{__('Expiry Date')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'ReportsShowing'}>
        {/* {reports.map(reports => {
          return (
            <Row
              space={0}
              key={reports._id}
              reports={reports}
              remove={remove}
              edit={edit}
              renderButton={renderButton}
              reports={reports}
              types={types}
            />
          );
        })} */}
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
      leftSidebar={<SideBarList />}
      hasBorder
    />
  );
}

export default List;
