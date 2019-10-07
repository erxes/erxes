import { colors, dimensions } from 'modules/common/styles';
import { Attachment } from 'modules/inbox/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const AttachmentContainer = styled(Attachment)`
  padding: 5px 10px;
  border-radius: 2px;
  margin: 0 0 5px 5px;
  color: ${colors.colorWhite};

  i {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity ease 0.3s;
    font-size: 12px;

    &:hover {
      opacity: 1;
    }
  }
`;

const Uploading = styled.div`
  position: relative;
  height: 33px;
  top: -4px;
  left: 25px;

  span {
    position: absolute;
    width: 100px;
    top: 6px;
    left: 25px;
  }
`;

const ControlWrapper = styled.div`
  position: relative;
`;

const LeftSection = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 5px 10px 0 0;
`;

const MailEditorWrapper = styled.div`
  position: relative;
  background: ${colors.colorWhite};
  margin: ${dimensions.coreSpacing}px 0;
`;

const Resipients = styledTS<{ isActive?: boolean }>(styled.a)`
  padding-left: ${dimensions.unitSpacing}px;
  font-size: 12px;
  color: ${colors.colorCoreLightGray};
  display: ${props => props.isActive && 'none'};

  &:hover {
    cursor: pointer;
    color: ${colors.colorCoreGray};
  }
`;

const EditorFooter = styled.div`
  margin: -${dimensions.unitSpacing}px 15px 15px;
`;

const Attachments = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: -10px 0 ${dimensions.coreSpacing}px -5px;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;

  > label {
    margin-right: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
  }
`;

const ToolBar = styled.div`
  i {
    font-size: 18px;
    color: ${colors.colorLightGray};
  }

  label {
    color: ${colors.colorCoreGray};
    margin-right: 10px;
    font-size: 14px;

    &:hover {
      cursor: pointer;
    }
  }

  input[type='file'] {
    display: none;
  }
`;

const SpaceBetweenRow = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
`;

const Column = styled.div`
  flex: 1;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const Subject = styled.div`
  padding: ${dimensions.unitSpacing}px 15px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

export {
  Attachments,
  FlexRow,
  Column,
  Subject,
  ToolBar,
  MailEditorWrapper,
  ControlWrapper,
  LeftSection,
  Resipients,
  Uploading,
  AttachmentContainer,
  SpaceBetweenRow,
  EditorFooter
};
