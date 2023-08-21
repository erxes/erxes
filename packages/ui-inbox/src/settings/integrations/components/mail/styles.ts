import { colors, dimensions } from '@erxes/ui/src/styles';

import { Attachment } from '@erxes/ui-inbox/src/inbox/styles';
import { SelectWrapper } from '@erxes/ui/src/components/form/styles';
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
  display: flex;
  gap: 15px;
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

    &.from {
      margin-top: 7px;
    }
  }
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;

  i {
    font-size: 18px;
    color: ${colors.colorLightGray};
  }

  label {
    background: none !important;
    color: ${colors.colorCoreGray};
    margin-right: 10px !important;
    font-size: 14px;
    margin-bottom: 0 !important;
    margin-top: 0 !important;
    padding: 0 !important;

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

const PopoverLinkWrapper = styled.div`
  padding: ${dimensions.unitSpacing - 5}px ${dimensions.coreSpacing}px;

  a > i {
    padding-right: ${dimensions.unitSpacing - 5}px;
  }

  &:hover {
    a {
      color: #666;
    }
  }
`;

const Meta = styledTS<{ toggle?: boolean }>(styled.div)`
  padding: ${dimensions.unitSpacing - 2}px ${dimensions.coreSpacing}px;
  display: flex;
  align-items: baseline;
  border-bottom: ${props =>
    props.toggle ? 0 : `1px solid ${colors.borderPrimary}`};


  &:hover {
    cursor: pointer;
  }
`;

const NewEmailHeader = styled.h5`
  background: ${colors.bgActive};
  margin-bottom: 0;
  margin-top: 0;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;

  i {
    margin-left: 5px;
    padding: 5px;

    &:hover {
      background: ${colors.bgGray};
    }
  }

  span {
    flex: 1;
  }
`;

const WidgetWrapper = styledTS<{ show: boolean; shrink: boolean }>(styled.div)`
  position: fixed;
  bottom: ${dimensions.unitSpacing}px;
  right: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: column;
  z-index: 300;
  justify-content: flex-end;
  align-content: flex-end;
  background: #fff;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  border-radius: 8px;
  width: ${props => (props.shrink ? '260px' : '600px')};
  overflow: hidden;

  ${props => !props.show && 'display:none;'}
`;

const UploaderWrapper = styled.div`
  max-height: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
`;

const WidgetButton = styled.div`
  cursor: pointer;
  text-align: center;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
  color: ${colors.textSecondary};

  span {
    position: absolute;
    top: -4px;
    right: -8px;
    padding: 3px;
    min-width: 18px;
    min-height: 18px;
    line-height: 12px;
  }
`;

const Link = styled.a`
  cursor: pointer;
`;

export {
  Attachments,
  FlexRow,
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
  ShowReplies,
  PopoverLinkWrapper,
  Meta,
  NewEmailHeader,
  WidgetWrapper,
  UploaderWrapper,
  WidgetButton,
  Link
};
