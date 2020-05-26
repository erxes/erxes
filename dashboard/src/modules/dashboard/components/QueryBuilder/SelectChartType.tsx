import { Icon } from '@ant-design/compatible';
import { Menu } from 'antd';
import { chartTypes } from 'modules/dashboard/constants';
import React from 'react';
import ButtonDropdown from './ButtonDropdown';

const SelectChartType = ({ chartType, updateChartType }) => {
  const menu = (
    <Menu>
      {chartTypes.map((m) => (
        <Menu.Item key={m.title} onClick={() => updateChartType(m.name)}>
          <Icon type={m.icon} />
          {m.title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const foundChartType = chartTypes.find((t) => t.name === chartType);
  
  return (
    <ButtonDropdown
      overlay={menu}
      icon={<Icon type={foundChartType ? foundChartType.icon : ''} />}
    >
      {foundChartType ? foundChartType.title : ''}
    </ButtonDropdown>
  );
};

export default SelectChartType;
