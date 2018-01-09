import styled from 'styled-components';
import { colors, dimensions } from '../common/styles';

const SidebarListli = styled.li`
  border-top: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  transition: all ease 0.3s;

  a {
    &:hover {
      background: none;
    }
  }

  &:hover {
    background: ${colors.bgLight};
    cursor: pointer;
  }
`;

const Members = styled.div`
  padding: 5px 0 0 17px;
`;

const MemberImg = styled.img`
  width: 30px;
  border-radius: 15px;
  border: 2px solid ${colors.colorWhite};
  margin-left: -8px;
`;

const More = MemberImg.withComponent('span').extend`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: ${dimensions.unitSpacing}px;
  background: ${colors.colorCoreLightGray};
  display: inline-block;
  line-height: 28px;
  cursor: pointer;
`;

const RightButton = styled.div`
  position: absolute;
  right: 20px;
  top: 16px;
`;

const ManageActions = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;

  * {
    padding: 0;
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const Row = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  transition: all ease 0.3s;

  &:hover {
    ${ManageActions} {
      width: 43px;
      padding-left: ${dimensions.unitSpacing - 5}px;
      align-items: center;
      display: flex;
    }
  }

  ${ManageActions} {
    width: 0;
    padding-left: ${dimensions.unitSpacing - 5}px;
    overflow: hidden;
    display: flex;
    transition: all ease 0.3s;

    > label {
      margin-top: ${dimensions.unitSpacing}px;
    }
  }

  > div {
    margin: 0;
  }
`;

const RowContent = styled.div`
  flex: 1;

  > a {
    padding: 0 ${dimensions.unitSpacing}px;
  }
`;

export {
  SidebarListli,
  MemberImg,
  Members,
  More,
  RightButton,
  ActionButtons,
  ManageActions,
  Row,
  RowContent
};
