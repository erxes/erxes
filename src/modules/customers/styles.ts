import { colors, dimensions } from 'modules/common/styles';
import { Attachment } from 'modules/inbox/styles';
import { SidebarList } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Info = styled.div`
  margin-top: 5px;
  white-space: normal;

  > span {
    font-weight: normal;
  }
`;

const InfoTitle = styled.span`
  font-weight: 500;
  margin-bottom: 5px;
  margin-right: 10px;
`;

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const MailEditorWrapper = styled.div`
  position: relative;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

const ControlWrapper = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;

  span {
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 6px 10px 0 0;
    font-weight: 500;
  }

  input {
    padding-left: 0;

    &:hover, &:focus {
      border-color: ${colors.colorShadowGray};
    }
  }
`;

const LeftSection = styled.div`
  border-bottom: 1px solid ${colors.colorShadowGray};
  padding: 5px 10px 0 0;
`;

const Resipients = styledTS<{ isActive?: boolean }>(styled.a)`
  padding-left: 10px;
  font-weight: 500;
  display: ${props => props.isActive && 'none'};

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const List = SidebarList.extend`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: 10px 20px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    &:last-child {
      border: none;
    }
  }
`;

const AttachmentContainer = Attachment.extend`
  i {
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.colorPrimaryDark};
    }
  }
`;

const InfoAvatar = styled.img`
  width: 40px;
  border-radius: 40px;
`;

export { InfoTitle, InfoDetail, Info, Action, List, InfoAvatar, MailEditorWrapper, ControlWrapper, LeftSection, Resipients, AttachmentContainer };
