import { Icon } from '@ant-design/compatible';
import { Menu } from 'antd';
import React from 'react';
import ButtonDropdown from './ButtonDropdown';
const ChartTypes = [
  {
    name: 'line',
    title: 'Line',
    icon: 'line-chart',
  },
  {
    name: 'area',
    title: 'Area',
    icon: 'area-chart',
  },
  {
    name: 'bar',
    title: 'Bar',
    icon: 'bar-chart',
  },
  {
    name: 'pie',
    title: 'Pie',
    icon: 'pie-chart',
  },
  {
    name: 'table',
    title: 'Table',
    icon: 'table',
  },
  {
    name: 'number',
    title: 'Number',
    icon: 'info-circle',
  },
];

const SelectChartType = ({ chartType, updateChartType }) => {
  const menu = (
    <Menu>
      {ChartTypes.map((m) => (
        <Menu.Item key={m.title} onClick={() => updateChartType(m.name)}>
          <Icon type={m.icon} />
          {m.title}
        </Menu.Item>
      ))}
    </Menu>
  );
  const foundChartType = ChartTypes.find((t) => t.name === chartType);
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
