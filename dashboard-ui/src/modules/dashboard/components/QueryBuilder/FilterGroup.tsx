import { Select } from 'antd';

import React from 'react';
import FilterInputContainer from '../../containers/FilterInput';
import MemberDropdown from './MemberDropdown';
import RemoveButtonGroup from './RemoveButtonGroup';

type Props = {
  members: any;
  availableMembers: any[];
  addMemberName: any;
  updateMethods: any;
  schemaType?: string;
};

class FilterGroup extends React.Component<Props> {
  onChangeOperator = (operator, m) => {
    const { updateMethods } = this.props;

    updateMethods.update(m, { ...m, operator });
  };

  onChangeMember = (updateWith, m) => {
    const { updateMethods } = this.props;

    updateMethods.update(m, { ...m, updateWith });
  };

  selectMember = value => {
    const { updateMethods } = this.props;

    updateMethods.add({
      dimension: value
    });
  };

  renderInput = m => {
    const { updateMethods } = this.props;

    if (['set', 'notSet'].includes(m.operator)) {
      return;
    }

    return (
      <FilterInputContainer
        type={m.dimension.name}
        member={m}
        key="filterInput"
        updateMethods={updateMethods}
      />
    );
  };

  render() {
    const {
      members,
      availableMembers,
      updateMethods,
      schemaType,
      addMemberName
    } = this.props;

    return (
      <span>
        {members.map(m => {
          return (
            <div
              style={{
                marginBottom: 12
              }}
              key={m.index}
            >
              <RemoveButtonGroup onRemoveClick={() => updateMethods.remove(m)}>
                <MemberDropdown
                  schemaType={schemaType}
                  onClick={updateWith =>
                    updateMethods.update(m, { ...m, dimension: updateWith })
                  }
                  availableMembers={availableMembers}
                  addMemberName={addMemberName}
                >
                  {m.dimension.shortTitle}
                </MemberDropdown>
              </RemoveButtonGroup>
              <Select
                value={m.operator}
                onChange={operator => this.onChangeOperator(operator, m)}
                style={{
                  width: 200,
                  marginRight: 8,
                  marginLeft: 8
                }}
              >
                {m.operators.map(operator => (
                  <Select.Option key={operator.name} value={operator.name}>
                    {operator.title}
                  </Select.Option>
                ))}
              </Select>
              {this.renderInput(m)}
            </div>
          );
        })}
        <MemberDropdown
          onClick={m => this.selectMember(m)}
          availableMembers={availableMembers}
          type="dashed"
          schemaType={schemaType}
          addMemberName={addMemberName}
        >
          {addMemberName}
        </MemberDropdown>
      </span>
    );
  }
}

export default FilterGroup;
