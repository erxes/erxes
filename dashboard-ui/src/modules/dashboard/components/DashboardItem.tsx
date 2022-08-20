import { Dropdown, Menu, Modal } from 'antd';
import { getDashboardToken, getEnv } from 'apolloClient';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import { Link } from 'react-router-dom';
import { StyledCard } from './styles';

const { REACT_APP_DASHBOARD_API_URL } = getEnv();
const dashboardToken = getDashboardToken();

const DashboardItemDropdown = ({
  itemId,
  dashboardId,
  removeDashboardItem,
  query,
  title
}) => {
  const onClick = () => {
    window.open(
      `${REACT_APP_DASHBOARD_API_URL}/export-report?dashboardQuery=${JSON.stringify(
        query
      )}&dashboardToken=${dashboardToken}&dashboardName=${title}`,
      '_blank'
    );
  };

  const dashboardItemDropdownMenu = (
    <Menu>
      <Menu.Item>
        <Link to={`/explore?itemId=${itemId}&dashboardId=${dashboardId}`}>
          Edit
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link onClick={onClick}>Download as excel</Link>
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          Modal.confirm({
            title: 'Are you sure you want to delete this item?',
            icon: <Icon icon="exclamation-circle" />,
            okText: 'Yes',
            cancelText: 'No',
            okButtonProps: {
              shape: 'round',
              icon: <Icon icon="check-circle" />
            },
            cancelButtonProps: {
              shape: 'round',
              icon: <Icon icon="times-circle" />
            },
            onOk() {
              removeDashboardItem(itemId);
            }
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
      placement="bottomLeft"
      trigger={['click']}
    >
      <Icon icon="bars" />
    </Dropdown>
  );
};

const DashboardItem = ({
  itemId,
  dashboardId,
  children,
  title,
  removeDashboardItem,
  query
}) => (
  <StyledCard
    title={title}
    bordered={false}
    extra={
      <DashboardItemDropdown
        itemId={itemId}
        dashboardId={dashboardId}
        removeDashboardItem={removeDashboardItem}
        query={query}
        title={title}
      />
    }
  >
    {children}
  </StyledCard>
);

export default DashboardItem;
