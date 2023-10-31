import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '@erxes/ui/src/styles/colors';
import { dimensions } from '@erxes/ui/src/styles';
import { rgba, lighten } from '@erxes/ui/src/styles/ecolor';
import { ActionButtons } from '@erxes/ui-settings/src/styles';

export const CommentContainer = styled.div`
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.coreSpacing}px;
  border-radius: 5px;
  margin-top: ${dimensions.coreSpacing}px;
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

export const CommentForm = styledTS<{ isReply?: boolean }>(styled.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${props =>
    props.isReply
      ? `${dimensions.coreSpacing}px 0 0 0`
      : `${dimensions.coreSpacing}px 0`};
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 5px;
  
  input {
    border-bottom: none;
  }
`;

export const CommentSection = styled.div`
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;
`;

export const Reply = styled.div`
  margin-left: ${dimensions.coreSpacing * 2}px;
`;

export const Thumbnail = styled.img`
  max-height: 400px;
`;

export const StepItem = styled.div`
  box-shadow: rgba(0, 0, 0, 0.15) 0px 1px 5px 0;
  border-radius: 2px;
  margin-bottom: ${dimensions.unitSpacing}px;

  &:last-of-type {
    margin: 0;
  }
`;

export const StepHeader = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: 15px 30px;
  position: relative;
  background: ${colors.bgLight};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  font-weight: 500;
`;

export const StepBody = styled.div`
  padding: 20px 30px 30px 30px;
  background: ${colors.colorWhite};

  > div:last-of-type {
    margin: 0;
  }
`;

export const Divider = styled.div`
  border-bottom: 1px dotted ${rgba(colors.colorPrimary, 0.5)};
  padding-bottom: ${dimensions.unitSpacing}px;
  margin: 0 0 ${dimensions.coreSpacing}px 0px;
`;

export const DividerText = styled.span`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreRed};
  border: 1px solid ${colors.colorCoreRed};
  border-radius: 2px;
  padding: 3px 5px;
  font-size: 8px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  background: ${props => props.isActive && rgba(colors.colorPrimary, 0.2)};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    white-space: normal;
    flex: 1;
    color: ${props => props.isActive && colors.colorPrimary};
    font-weight: ${props => (props.isActive ? 600 : 500)};

    border-bottom: 1px solid ${colors.borderPrimary};

    margin: 0 20px;
    padding: 10px 0;

    &:hover {
      background: none;
      color: ${props => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    &:focus {
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

export const SidebarItem = styled(SidebarListItem)`
  &:hover {
    ${ActionButtons} {
      width: 50px;
    }
  }
`;

export const Filter = styled.div`
  width: 130px;
  margin-right: ${dimensions.unitSpacing}px;
`;

export const DetailLink = styled.div`
  a {
    color: ${colors.textPrimary};
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;

  .submit {
    width: fit-content;
  }
`;

export const MarginAuto = styled.div`
  display: flex;
  margin: auto;
`;

export const ChoiceList = styled.div`
  display: flex;
  padding: ${dimensions.unitSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${colors.bgActive};
  }
`;

export const ChoiseTitle = styledTS<{ isCorrect?: boolean }>(styled.div)`
  ${props =>
    props.isCorrect &&
    `
    &:after {
      content: '✓';
      background-color: #3CCC38;
      border-radius: 50%;
      color: #fff;
      height: 20px;
      justify-content: center;
      align-items: center;
      width: 20px;
      display: inline-flex;
      margin-left: 10px;
    }
  `}
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;

  button {
    margin-top: 10px;
  }

  li {
    position: relative;
    margin-bottom: 5px;
    background-color: ${colors.colorWhite};
    border: 1px solid ${colors.borderPrimary};
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: none;

    &:hover {
      cursor: pointer;
    }
  }

  input.editInput {
    border: none;
    outline: none;
  }

  input.editInput:focus {
    outline: none;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

export const CustomRangeContainer = styled.div`
  margin-left: 20px;

  > div {
    flex: 1;
    margin-right: 8px;

    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

export const PostTitle = styled.p`
  max-width: 500px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Space = styled.div`
  gap: 7px;
  display: flex;
`;
