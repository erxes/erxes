import { Dropdown, Menu } from 'antd';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import { Link } from 'react-router-dom';
import { StyledCard } from '../styles';

// const domain = document.domain;

const DashboardItemDropdown = ({ item, dashboardId, save }) => {
  const saveChart = () => {
    const doc = {
      name: item.name,
      dashboardId,
      vizState: item.vizState,
      type: item.type
    };

    return save(doc);
  };

  const dashboardItemDropdownMenu = (
    <Menu>
      <Menu.Item onClick={() => saveChart()}>Save to dashboard</Menu.Item>
      <Menu.Item>
        <Link
          to={`/explore?itemName=${item.name}&dashboardId=${dashboardId}&vizState=${item.vizState}&type=${item.type}`}
        >
          Edit in builder
        </Link>
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

const InitialDataItem = ({
  item,
  dashboardId,
  children,
  title,
  save,
  bordered
}) => (
  <StyledCard
    title={title}
    bordered={bordered}
    extra={
      <DashboardItemDropdown
        item={item}
        dashboardId={dashboardId}
        save={save}
      />
    }
  >
    {children}
  </StyledCard>
);

export default InitialDataItem;
