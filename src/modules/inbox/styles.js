import styled from 'styled-components';
import { colors } from '../common/styles';
import { rgba, darken } from '../common/styles/color';

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  > * {
    display: inline-block;
  }

  button {
    padding: 0;
  }

  i {
    margin-left: 5px;
    margin-right: 0;
    font-size: 10px;
    transition: all ease 0.3s;
    color: ${colors.colorCoreGray};
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
      min-height: 100px;
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

const ResponseSuggestions = styled.ul`
  position: absolute;
  left: 0px;
  bottom: 100%;
  margin: 0;
  padding: 0;
  z-index: 1;
  width: 100%;
  list-style-type: none;
  background: ${colors.colorWhite};
  box-shadow: 0 0 10px -3px rgba(0, 0, 0, 0.5);
`;

const ResponseSuggestionItem = styled.li`
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  padding: 5px 20px;
  text-overflow: ellipsis;

  :hover {
    background-color: #f6f8fb;
  }

  strong {
    color: #ec8d17;
  }
`;

const RespondBoxStyled = styled.div`
  position: relative;
  transition: background 0.3s ease;
  background: ${props =>
    props.isInternal ? colors.bgInternal : colors.colorWhite};

  filter: ${props => props.isInactive && 'blur(2px)'};

  ${RichEditorRoot} {
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

const ResponseTemplateStyled = styled.div`
  display: inline-block;

  button {
    margin-right: 10px;
    margin-left: 0;
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
      bottom: 20px;
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
  background-color: #f7f7f7;
  padding: 5px;

  input[type='text'] {
    padding: 4px 8px;
    font-size: 13px;

    &:focus {
      border-color: ${colors.borderDarker};
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
  font-weight: bold;
  margin-bottom: 2px;
`;

const TemplateContent = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: normal;
`;

const AttachmentIndicator = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 15px 10px 15px;
  color: ${rgba(colors.colorWhite, 0.7)};
`;

const Attachment = styled.div`
  display: flex;
  max-width: 220px;
  padding: 5px;
  margin: 5px 0 5px 5px;
  font-size: 12px;
  background-color: ${colors.colorSecondary};
  align-items: center;

  > div {
    margin-right: 5px;
  }
`;

const AttachmentThumb = styled.div`
  margin-right: 5px;
`;

const PreviewImg = styled.div`
  width: 26px;
  height: 26px;
  background-size: cover;
  background-position: 50%;
`;

const FileName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 5px;
  color: ${colors.colorWhite};
`;

const AssignText = styled.div`
  display: inline-block;
`;

const ActionBarLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AssignTrigger = styled.div`
  padding-left: 10px;

  i {
    margin-left: 5px;
    margin-right: 0;
    transition: all ease 0.3s;
    line-height: 30px;
    color: ${colors.colorCoreGray};
    font-size: 10px;
    display: inline-block;
  }

  &:hover {
    cursor: pointer;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};

    i {
      transform: rotate(180deg);
    }
  }

  img {
    margin: 0;
  }
`;

const MaskWrapper = styled.div`
  position: relative;
`;

const Mask = styled.div`
  position: absolute;
  padding: 20px;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;

  &:hover {
    cursor: pointer;
  }
`;

export {
  PopoverButton,
  ConversationWrapper,
  RespondBoxStyled,
  RichEditorRoot,
  RichEditorControlsRoot,
  RichEditorControls,
  ResponseSuggestions,
  ResponseSuggestionItem,
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
  AttachmentThumb,
  AttachmentIndicator,
  PreviewImg,
  FileName,
  AssignText,
  ActionBarLeft,
  AssignTrigger,
  Mask,
  MaskWrapper
};
