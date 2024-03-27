import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import SalaryList from '../containers/SalaryList';
import LeftSideBar from './sidebar/SideBar';

type Props = {
  queryParams: any;
  history: any;

  isEmployeeSalary: boolean;
} & IRouterProps;

const List = (props: Props) => {
  const { isEmployeeSalary, queryParams } = props;

  const [showSideBar, setShowSideBar] = useState(
    JSON.parse(localStorage.getItem('isSideBarOpen') || 'false')
  );
  const [rightActionBar, setRightActionBar] = useState(<div />);
  const [PaginationFooter, setPagination] = useState(<div />);
  const [loading, setLoading] = useState<any>(false);
  const [ContentComponent, setContentComponent] = useState(<div />);

  const [emptyContentButton, setEmptyContentButton] = useState(<div />);

  useEffect(() => {
    setContentComponent(
      <SalaryList
        {...props}
        getActionBar={setRightActionBar}
        showSideBar={setShowSideBar}
        getPagination={setPagination}
        setLoading={setLoading}
        setEmptyContentButton={setEmptyContentButton}
      />
    );
  }, [queryParams]);

  const breadcrumb = isEmployeeSalary
    ? [
        { title: __('Profile'), link: '/profile' },
        { title: __('Salary detail'), link: '/profile/salaries/bichil' }
      ]
    : [
        { title: __('Settings'), link: '/settings' },
        { title: __('Salaries'), link: '/salaries' }
      ];

  const emptyTitle = props.isEmployeeSalary
    ? 'Confirmation required'
    : 'No data';
  const emptyDescription = props.isEmployeeSalary
    ? 'Please confirm your password to view salary details'
    : 'There is no data to display or you do not have permission to view it';
  const steps: any[] = [];

  if (isEmployeeSalary) {
    steps.push({
      title: 'Confirm password',
      description: 'Please confirm your password to view salary details',
      content: <div>triggeeer</div>
    });
  }

  const emptyContent = (
    <EmptyContent
      content={{
        title: emptyTitle,
        description: emptyDescription,
        steps
      }}
      maxItemWidth='360px'
    />
  );

  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Salary details')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={rightActionBar}
        footer={PaginationFooter}
        content={
          <DataWithLoader
            data={ContentComponent}
            loading={loading}
            emptyContent={isEmployeeSalary ? emptyContentButton : emptyContent}
          />
        }
        leftSidebar={showSideBar && <LeftSideBar {...props} />}
        hasBorder={true}
      />
    </>
  );
};

export default List;
