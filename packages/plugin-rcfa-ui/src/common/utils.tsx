import React from 'react';
import {
  Spinner,
  Wrapper,
  DataWithLoader,
  Pagination,
  __
} from '@erxes/ui/src';

export const DefaultWrapper = ({
  title,
  rightActionBar,
  leftActionBar,
  loading,
  totalCount,
  content,
  sidebar,
  isPaginationHide,
  breadcrumb,
  subMenu
}: {
  title: string;
  rightActionBar?: JSX.Element;
  leftActionBar?: JSX.Element;
  loading?: boolean;
  totalCount?: number;
  content: JSX.Element;
  sidebar?: JSX.Element;
  isPaginationHide?: boolean;
  breadcrumb?: any[];
  subMenu?: { title: string; link: string }[];
}) => {
  if (loading) {
    return <Spinner objective />;
  }
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={title}
          submenu={subMenu}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
      }
      content={
        <DataWithLoader
          loading={loading || false}
          data={content}
          count={totalCount}
          emptyImage="/images/actions/5.svg"
          emptyText={__('No data')}
        />
      }
      leftSidebar={sidebar}
      footer={!isPaginationHide && <Pagination count={totalCount} />}
    />
  );
};
