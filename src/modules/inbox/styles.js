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
    transition: all ease 0.3s;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};

    i {
      transform: rotate(180deg);
    }
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
      padding: 15px 20px;
      position: absolute;
      color: ${colors.colorCoreGray};
      font-size: 13px;
    }

    .public-DraftEditorPlaceholder-inner {
      color: ${colors.colorCoreLightGray};
    }

    .public-DraftEditor-content {
      font-size: 13px;
      padding: 15px 20px;
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
  padding: 7px 20px 0;
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
  background: ${props =>
    props.isInternal ? colors.bgInternal : colors.colorWhite};

  ${RichEditorRoot} {
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

const ResponseTemplateStyled = styled.div`
  display: inline-block;

  button {
    margin-right: 10px;
    padding: 0;
  }

  span {
    margin: 0;
  }
`;

const EditorActions = styled.div`
  padding: 0 20px 10px 20px;
  text-align: right;
  position: relative;
  color: ${colors.colorCoreGray};
  display: flex;
  justify-content: flex-end;
  align-items: center;

  label {
    margin: 0 10px 0 0;

    &:hover {
      cursor: pointer;
      color: ${darken(colors.colorCoreGray, 30)};
    }

    &:first-of-type {
      position: absolute;
      left: 20px;
    }
  }

  i {
    margin: 0;
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
  position: relative;

  li {
    position: relative;
    display: block;
    overflow: hidden;
    padding: 5px 20px;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;
    text-align: ${props => props.center && 'center'};

    &:hover,
    &:focus {
      background: ${colors.bgLight};
    }

    a {
      color: #383838;
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
  font-weight: normal;
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

const AssignText = styled.div`
  margin-right: 10px;
  display: inline-block;
  color: ${colors.colorBlack};
`;

const AssignWrapper = styled.div`
  display: -webkit-inline-box;

  &[aria-describedby] {
    color: ${colors.colorSecondary};

    i {
      transform: rotate(180deg);
    }
  }
`;

export {
  PopoverButton,
  ConversationWrapper,
  RespondBoxStyled,
  RichEditorRoot,
  RichEditorControlsRoot,
  RichEditorControls,
  MentionedPerson,
  EditorActions,
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
  AssignText,
  AssignWrapper,
  PreviewImg,
  FileName,
  FileSize
};
