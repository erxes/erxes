import styled from 'styled-components';
import { colors } from '../common/styles';
import { rgba, darken } from '../common/styles/color';

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  > * {
    display: inline-block;
  }

  i {
    margin-left: 5px;
    margin-right: 0;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};
  }

  &:hover {
    cursor: pointer;
  }
`;

const ConversationWrapper = styled.div`
  height: 100%;
  overflow: auto;
  background: ${colors.bgLight};
`;

const RichEditorRoot = styled.div`
  font-size: 14px;

  .RichEditor-editor {
    border-top: 1px solid ${colors.borderPrimary};
    cursor: text;

    .public-DraftEditorPlaceholder-root {
      padding: 15px;
      position: absolute;
      color: ${colors.colorCoreGray};
    }

    .public-DraftEditorPlaceholder-inner {
      color: ${colors.colorCoreGray};
    }
  }

  .RichEditor-controls {
    float: left;
    font-size: 14px;
    user-select: none;
    margin-bottom: 5px;
  }
`;

const RichEditorControlsRoot = styled.div`
  overflow: hidden;
  padding: 5px 15px 0;
`;

const RichEditorRight = styled.div`
  float: right;
`;

const RichEditorControls = styled.div`
  float: left;
  font-size: 14px;
  user-select: none;
  margin-bottom: 5px;

  .RichEditor-styleButton {
    color: ${colors.colorCoreGray};
    cursor: pointer;
    margin-right: 16px;
    padding: 2px 0;
    display: inline-block;
    min-width: 10px;
    text-align: center;

    &:hover {
      color: ${rgba(colors.colorPrimary, 0.7)};
    }
  }

  .RichEditor-activeButton {
    color: ${colors.colorPrimary};
  }
`;

const MentionedPerson = styled.span`
  cursor: pointer;
  display: inline-block;
  font-weight: bold;
  padding-left: 2px;
  padding-right: 2px;
  border-radius: 4px;
  text-decoration: none;
`;

const RespondBoxStyled = styled.div`
  position: relative;

  ${RichEditorRoot} {
    background: ${colors.colorWhite};
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-top: 1px solid ${colors.borderPrimary};
  }

  .checkbox {
    position: absolute;
    left: 20px;
    bottom: 0;
    color: #888;
    line-height: 22px;

    input {
      margin: 5px 0 0 -20px;
    }
  }
`;

const ResponseTemplateStyled = styled.div`
  display: inline-block;

  .dropup {
    padding: 2px 0;
  }

  span {
    margin: 0;
  }
`;

const ReplyFormFooter = styled.div`
  background-color: ${colors.colorWhite};
  display: flow-root;

  .replyBtn {
    margin-right: 10px;
    float: right;

    &:hover {
      text-decoration: none;
    }
  }

  .btnLink {
    box-shadow: none;
    font-weight: 400;
    color: ${colors.colorCoreGray};
    border-radius: 0;

    &:hover {
      color: ${darken(colors.colorCoreGray, 30)};
    }
  }

  input[type='file'] {
    display: none;
  }
`;

const InlineHeader = styled.div`
  display: flex;
  flex: 2;
  font-size: 12px;
`;
const InlineColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: baseline;

  &:first-child {
    margin-right: 5px;
  }
`;
const InlineHeaderSpan = styled.span`
  margin: 0 8px;
`;
const PopoverHeader = styled.div`
  background-color: #eee;
  padding: 5px;

  input[type='text'] {
    padding: 4px 8px;
    font-size: 13px;

    &:focus {
      border-color: #ddd;
      box-shadow: none;
    }
  }
`;
const PopoverFooter = styled.div`
  padding: 5px 0;
  border-top: 1px solid #eee;
  align-self: flex-end;
  width: 100%;
`;
const PopoverList = styled.ul`
  max-height: 275px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;

  li {
    position: relative;
    display: block;
    overflow: hidden;
    padding: 5px 20px;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;

    &:hover,
    &:focus {
      background: #f8f8f8;
    }

    a {
      color: #383838;
    }
  }

  .linked {
    li {
      padding: 0;
      border-bottom: 0;

      a {
        display: block;
        padding: 5px 20px;
      }
    }
  }
`;
const PopoverBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;

  ${PopoverList} {
    max-height: none;
    display: flex;
    flex-direction: column;
    min-height: 100%;

    li {
      white-space: normal;
      font-size: 12px;
      padding: 10px 20px;
      border-bottom: 1px solid #eee;

      &:hover {
        cursor: pointer;
      }
    }

    .linked {
      li {
        padding: 0;
        border-bottom: 0;
      }
    }
  }
`;
const TemplateTitle = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const TemplateContent = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const AttachmentIndicator = styled.div`
  background: #ece6f8;
  display: flex;
  flex-direction: row;
`;

const Attachment = styled.div`
  display: flex;
  max-width: 220px;
  padding: 4px;
  margin: 5px 0 5px 5px;
  font-size: 13px;
  border-radius: 4px;
  background-color: ${colors.colorSecondary};
  align-items: center;
`;

const AttachmentPreview = styled.div`
  margin-right: 5px;
`;

const PreviewImg = styled.div`
  width: 26px;
  height: 26px;
  background-size: cover;
  background-position: 50%;
  border-radius: 2px;
`;

const FileName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 5px;
`;

const FileSize = styled.div`
  color: ${colors.colorWhite};
`;

export {
  PopoverButton,
  ConversationWrapper,
  RespondBoxStyled,
  RichEditorRoot,
  RichEditorControlsRoot,
  RichEditorControls,
  MentionedPerson,
  ReplyFormFooter,
  RichEditorRight,
  ResponseTemplateStyled,
  PopoverHeader,
  InlineHeader,
  InlineColumn,
  InlineHeaderSpan,
  PopoverBody,
  PopoverList,
  TemplateTitle,
  TemplateContent,
  PopoverFooter,
  Attachment,
  AttachmentPreview,
  AttachmentIndicator,
  PreviewImg,
  FileName,
  FileSize
};
