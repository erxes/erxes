import { SelectWrapper } from 'modules/common/components/form/styles';
import { colors, dimensions } from 'modules/common/styles';
import { Attachment } from 'modules/inbox/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const AttachmentContainer = styled(Attachment)`
  padding: 3px 8px;
  border-radius: 2px;
  margin: 0 5px 5px 0;
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

const FileSize = styled.div`
  font-size: 90%;
  opacity: 0.9;
`;

const Uploading = styled.div`
  display: flex;
  align-items: baseline;
  color: ${colors.colorCoreGray};
  font-size: 12px;
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

  .cke {
    border: 0;
    border-bottom: 1px solid ${colors.borderPrimary};
  }

  .cke_inner {
    position: relative;

    .cke_resizer {
      display: none;
    }

    .cke_bottom {
      background: ${colors.bgLight};
      padding-left: ${dimensions.coreSpacing}px;
      padding-right: ${dimensions.coreSpacing}px;
      border-top: 1px solid ${colors.borderPrimary};
      max-height: 60px;
      overflow: hidden;
    }
  }

  .cke_toolgroup {
    border: 0;
    margin-left: ${dimensions.unitSpacing / 2}px;
  }
`;

const Resipients = styledTS<{ isActive?: boolean }>(styled.a)`
  padding-left: ${dimensions.unitSpacing}px;
  font-size: 12px;
  color: ${colors.colorCoreLightGray};
  display: ${props => props.isActive && 'none'};
  font-weight: 500;

  &:hover {
    cursor: pointer;
    color: ${colors.colorCoreGray};
  }
`;

const EditorFooter = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

const Attachments = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 6px ${dimensions.coreSpacing}px 2px ${dimensions.coreSpacing}px
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;

  > label {
    margin: 2px ${dimensions.unitSpacing}px 2px 0;
    color: ${colors.colorCoreGray};
    align-self: baseline;
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
    margin-bottom: 0;

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

  textarea,
  input,
  ${SelectWrapper} {
    height: ${dimensions.coreSpacing}px;
    border-bottom: 0;
    padding: 0;
    min-height: auto;
  }

  ${SelectWrapper} {
    width: auto;
    display: inline-flex;
    padding-right: 10px;
    background: ${colors.bgActive};

    &:after {
      top: 5px;
    }

    select {
      height: ${dimensions.coreSpacing}px;
    }
  }
`;

const Column = styled.div`
  flex: 1;
`;

const Subject = styledTS<{ noBorder?: boolean }>(styled.div)`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-bottom:${props =>
    !props.noBorder && `1px solid ${colors.borderPrimary}`};

  input {
    height: ${dimensions.coreSpacing}px;
    border-bottom: 0;
  }
`;

const ShowReplyButtonWrapper = styled.div`
  position: absolute;
  z-index: 100;
  width: 100%;
  height: 50px;
  bottom: 42px;
`;

const ShowReplies = styled.div`
  background-color: #eee;
  margin-left: 20px;
  margin-top: 10px;
  width: 35px;
  height: 11px;
  display: flex;
  border-radius: 8px;
  padding: 3px;
  justify-content: space-evenly;
  cursor: pointer;

  span {
    overflow: hidden;
    height: 5px;
    width: 5px;
    box-sizing: border-box;
    border-radius: 50%;
    background-color: ${colors.colorLightGray};
  }
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
  EditorFooter,
  FileSize,
  ShowReplyButtonWrapper,
  ShowReplies
};
