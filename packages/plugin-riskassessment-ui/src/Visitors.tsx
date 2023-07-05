import { SelectTeamMembers } from '@erxes/ui/src';
import React from 'react';

type Props = {
  onSelect: (
    value: string | string[],
    name: string,
    extraValue: string
  ) => void;
  value: string;
};

class SelectVisitors extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { onSelect, value } = this.props;

    return (
      <SelectTeamMembers
        label="Select Visitors"
        name="visitors"
        multi={true}
        initialValue={value}
        onSelect={(value, name) =>
          onSelect(value, name, 'riskAssessmentVisitors')
        }
        customOption={{ value: '', label: 'Choose Visitors' }}
      />
    );
  }
}

export default SelectVisitors;
