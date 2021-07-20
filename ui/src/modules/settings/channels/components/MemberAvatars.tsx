import { IUser } from 'modules/auth/types';
import Tip from 'modules/common/components/Tip';
import { getUserAvatar } from 'modules/common/utils';
import React from 'react';
import { MemberImg, Members, More } from '../styles';

type Props = {
  selectedMemberIds: string[];
  allMembers: IUser[];
};

export default function MemberAvatars(props: Props) {
  const renderMember = member => {
    return (
      <Tip key={member._id} text={member.details.fullName} placement="top">
        <MemberImg key={member._id} src={getUserAvatar(member)} />
      </Tip>
    );
  };

  const renderMembers = () => {
    const { selectedMemberIds, allMembers } = props;

    let selectedMembers: IUser[] = [];
    selectedMembers = allMembers.filter(
      user => user.isActive && selectedMemberIds.includes(user._id)
    );

    const length = selectedMembers.length;
    const limit = 8;

    // render members ================
    const limitedMembers = selectedMembers.slice(0, limit);
    const renderedMembers = limitedMembers.map(member => renderMember(member));

    // render readmore ===============
    let readMore: React.ReactNode;

    if (length - limit > 0) {
      readMore = <More key="readmore">{`+${length - limit}`}</More>;
    }

    return [renderedMembers, readMore];
  };

  return <Members>{renderMembers()}</Members>;
}
