import React, { useState } from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import { FormControl } from '@erxes/ui/src/components';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import { IReport } from '../types';
import Row from './Row';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import SideBar from '../containers/SideBar';
type Props = {
  reports: IReport[];
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  removeReports: (reportIds: string[], callback: any) => void;
  editReport?: (report: IReport) => void;
  loading: boolean;

  queryParams: any;
};

type FinalProps = Props & IRouterProps;

function List(props: FinalProps) {
  const { reports, loading, history, queryParams, removeReports } = props;
  const [searchValue, setSearchvalue] = useState(queryParams.searchValue || '');
  const [chosenReportIds, setChosenReportIds] = useState<any>([]);

  const [timer, setTimer] = useState<NodeJS.Timer>(undefined);

  // let timer: NodeJS.Timer;

  const search = e => {
    if (timer) {
      clearTimeout(timer);
      setTimer(undefined);
    }

    const value = e.target.value;
    setSearchvalue(value);

    setTimer(
      setTimeout(() => {
        router.removeParams(history, 'page');
        router.setParams(history, { searchValue: value });
      }, 500)
    );
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

  const toggleReport = (reportId: string, isChecked?: boolean) => {
    if (isChecked) {
      setChosenReportIds([...chosenReportIds, reportId]);
    } else {
      setChosenReportIds(chosenReportIds.filter(id => id !== reportId));
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
          <th>{__('Charts')}</th>
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
              isChecked={chosenReportIds.includes(report._id) || false}
            />
          );
        })}
      </tbody>
    </Table>
  );

  // const SideBarList = asyncComponent(() =>
  //   import(/* webpackChunkName: "List - Reports" */ '../containers/SideBarList')
  // );
  const LeftSidebar = <SideBar {...props} />;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Reports'), link: '/reports' }
  ];

  let actionBarLeft: React.ReactNode;

  if (chosenReportIds.length) {
    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        Tag
      </Button>
    );

    actionBarLeft = (
      <BarItems>
        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={() =>
            removeReports(chosenReportIds, () => setChosenReportIds([]))
          }
        >
          Remove
        </Button>

        {isEnabled('tags') && (
          <TaggerPopover
            type={TAG_TYPES.REPORT}
            // successCallback={this.afterTag}
            targets={reports.filter(r => chosenReportIds.includes(r._id))}
            trigger={tagButton}
            // refetchQueries={['dashboardCountByTags']}
          />
        )}
      </BarItems>
    );
  }

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      left={actionBarLeft}
      wideSpacing
    />
  );

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
      leftSidebar={LeftSidebar}
      hasBorder
    />
  );
}

export default withTableWrapper('Dashboard', withRouter<IRouterProps>(List));
