import { Menu } from 'antd';
import Icon from 'modules/common/components/Icon';
import {
  chartTypes,
  chartTypesWithDeminsions,
  chartTypeWithoutDeminsions
} from 'modules/dashboard/constants';
import React from 'react';
import ButtonDropdown from './ButtonDropdown';

const SelectChartType = ({ chartType, updateChartType, query }) => {
  const menu = () => {
    if (query.dimensions.length > 0) {
      return (
        <Menu>
          {chartTypesWithDeminsions.map(m => (
            <Menu.Item key={m.title} onClick={() => updateChartType(m.name)}>
              <Icon icon={m.icon} />
              {m.title}
            </Menu.Item>
          ))}
        </Menu>
      );
    }
    return (
      <Menu>
        {chartTypeWithoutDeminsions.map(m => (
          <Menu.Item key={m.title} onClick={() => updateChartType(m.name)}>
            <Icon icon={m.icon} />
            {m.title}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const foundChartType = chartTypes.find(t => t.name === chartType);

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
