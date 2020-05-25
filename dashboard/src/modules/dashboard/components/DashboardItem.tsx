import { Icon } from '@ant-design/compatible';
import { Card, Dropdown, Menu, Modal } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  box-shadow: 0px 2px 4px rgba(141, 149, 166, 0.1);
  border-radius: 4px;
  height: 100%;
  width: 100%;

  .ant-card-head {
    border: none;
  }

  .ant-card-body {
    padding-top: 10px;
  }
`;

const DashboardItemDropdown = ({
  itemId,
  dashboardId,
  removeDashboardItem,
}) => {
  const dashboardItemDropdownMenu = (
    <Menu>
      <Menu.Item>
        <Link to={`/explore?itemId=${itemId}&dashboardId=${dashboardId}`}>
          Edit
        </Link>
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          Modal.confirm({
            title: 'Are you sure you want to delete this item?',
            okText: 'Yes',
            cancelText: 'No',

            onOk() {
              removeDashboardItem(itemId);
            },
          })
        }
      >
        Delete
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown
      overlay={dashboardItemDropdownMenu}
      placement='bottomLeft'
      trigger={['click']}
    >
      <Icon type='menu' />
    </Dropdown>
  );
};

const DashboardItem = ({
  itemId,
  dashboardId,
  children,
  title,
  removeDashboardItem,
}) => (
  <StyledCard
    title={title}
    bordered={false}
    extra={
      <DashboardItemDropdown
        itemId={itemId}
        dashboardId={dashboardId}
        removeDashboardItem={removeDashboardItem}
      />
    }
  >
    {children}
  </StyledCard>
);

export default DashboardItem;
