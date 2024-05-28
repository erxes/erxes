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

class SelectResolver extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { onSelect, value } = this.props;

    return (
      <SelectTeamMembers
        label="Select rcfa resolver"
        name="resolver"
        multi={true}
        initialValue={value}
        onSelect={(value, name) => onSelect(value, name, 'rcfaResolver')}
      />
    );
  }
}

export default SelectResolver;
