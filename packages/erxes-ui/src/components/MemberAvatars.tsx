import { IUser } from '@erxes/ui/src/auth/types';
import Tip from '@erxes/ui/src/components/Tip';
import { getUserAvatar } from '@erxes/ui/src/utils';
import React from 'react';
import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const imageSize = 30;

const Members = styled.div`
  padding-top: ${dimensions.unitSpacing - 5}px;
`;

const MemberImg = styled.img`
  width: ${imageSize}px;
  height: ${imageSize}px;
  border-radius: ${imageSize / 2}px;
  background: ${colors.bgActive};
  border: 2px solid ${colors.colorWhite};
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`;

const More = styled(MemberImg.withComponent('span'))`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: ${dimensions.unitSpacing}px;
  background: ${colors.colorCoreLightGray};
  display: inline-block;
  line-height: ${dimensions.coreSpacing + 6}px;
  cursor: pointer;
`;

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

  if (props.allMembers.length === 0 || props.selectedMemberIds.length === 0) {
    return null;
  }

  return <Members>{renderMembers()}</Members>;
}
