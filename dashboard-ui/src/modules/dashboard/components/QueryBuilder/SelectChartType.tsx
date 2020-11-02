import { Menu } from 'antd';
import Icon from 'modules/common/components/Icon';
import { chartTypes } from 'modules/dashboard/constants';
import React from 'react';
import ButtonDropdown from './ButtonDropdown';

const SelectChartType = ({ chartType, updateChartType }) => {
  const menu = (
    <Menu>
      {chartTypes.map((m) => (
        <Menu.Item key={m.title} onClick={() => updateChartType(m.name)}>
          <Icon icon={m.icon} />
          {m.title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const foundChartType = chartTypes.find((t) => t.name === chartType);
  
  return (
    <ButtonDropdown
      overlay={menu}
      icon={<Icon icon={foundChartType ? foundChartType.icon : ''} />}
    >
      {foundChartType ? foundChartType.title : ''}
    </ButtonDropdown>
  );
};

export default SelectChartType;
