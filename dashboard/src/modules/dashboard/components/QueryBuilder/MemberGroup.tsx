import { Icon } from '@ant-design/compatible';
import React from 'react';
import MemberDropdown from './MemberDropdown';
import RemoveButtonGroup from './RemoveButtonGroup';

type Props = {
  updateMethods: any;
  availableMembers: any[];
  members: any;
  addMemberName: string;
  type: string;
  memberGroupType: string;
};

class MemberGroup extends React.Component<Props> {
  renderMember = () => {
    const {
      members,
      addMemberName,
      availableMembers,
      updateMethods,
      type,
    } = this.props;

    if (members.length > 0) {
      return <span />;
    }

    return (
      <MemberDropdown
        onClick={(m) => updateMethods.add(m)}
        availableMembers={availableMembers}
        type="dashed"
        schemaType={type}
        icon={<Icon type="plus" />}
      >
        {addMemberName}
      </MemberDropdown>
    );
  };
  render() {
    const { members, availableMembers, updateMethods, type } = this.props;

    return (
      <span>
        {members.map((m) => (
          <RemoveButtonGroup
            key={m.index || m.name}
            onRemoveClick={() => updateMethods.remove(m)}
          >
            <MemberDropdown
              availableMembers={availableMembers}
              onClick={(updateWith) => updateMethods.update(m, updateWith)}
              schemaType={type}
            >
              {m.title}
            </MemberDropdown>
          </RemoveButtonGroup>
        ))}
        {this.renderMember()}
      </span>
    );
  }
}

export default MemberGroup;
