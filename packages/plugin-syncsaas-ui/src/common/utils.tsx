import {
  BarItems,
  ControlLabel,
  DataWithLoader,
  Icon,
  Pagination,
  Spinner,
  Wrapper,
  __
} from '@erxes/ui/src';
import React from 'react';
import { Card } from '../styles';

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

export function SelectCardType({ handleSelect, params }) {
  const options = [
    { value: 'deal', label: 'Deal', icon: 'piggy-bank' },
    { value: 'task', label: 'Task', icon: 'file-check-alt' },
    { value: 'ticket', label: 'Ticket', icon: 'ticket' }
  ];

  return (
    <BarItems>
      {options.map(option => {
        return (
          <Card
            key={option.value}
            className={params?.type === option.value ? 'active' : ''}
            onClick={() => handleSelect({ value: option.value })}
          >
            <Icon icon={option.icon} />
            <ControlLabel>{option.label}</ControlLabel>
          </Card>
        );
      })}
    </BarItems>
  );
}
