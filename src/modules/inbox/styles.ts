import {
  PopoverFooter as RootFooter,
  PopoverList as RootList
} from 'modules/common/components/filterableList/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../common/styles';
import { darken, rgba } from '../common/styles/color';

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  > * {
    display: inline-block;
  }

  > i {
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
  min-height: 100px;
  background: ${colors.bgLight};
`;

const RichEditorRight = styled.div`
  float: right;
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
  box-shadow: 0 -3px 20px -2px ${colors.darkShadow};
`;

const ResponseSuggestionItem = styled.li`
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  padding: 5px 20px;
  text-overflow: ellipsis;

  :hover {
    background-color: ${colors.bgUnread};
  }

  strong {
    color: ${colors.colorCoreRed};
  }
`;

const RespondBoxStyled = styledTS<{
  isInactive?: boolean;
  isInternal?: boolean;
}>(styled.div)`
  border-top: 1px solid ${colors.borderPrimary};
  position: relative;
  transition: background 0.3s ease;
  background: ${props =>
    props.isInternal ? colors.bgInternal : colors.colorWhite};
  filter: ${props => props.isInactive && 'blur(2px)'};
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
  background-color: ${colors.bgLight};

  input[type='text'] {
    padding: 4px 8px 4px 20px;
  }
`;

const PopoverFooter = styled(RootFooter)`
  align-self: flex-end;
  width: 100%;
`;

const PopoverList = styledTS<{ center?: boolean }>(styled(RootList))`
  position: relative;
  padding: 0;

  li {
    text-align: ${props => props.center && 'center'};

    a {
      color: ${colors.colorCoreDarkGray};
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
      border-bottom: 1px solid ${colors.borderPrimary};

      &:hover {
        cursor: pointer;
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
  flex-wrap: wrap;
  margin: 0 15px 10px 15px;
  color: ${rgba(colors.colorWhite, 0.7)};
`;

const Attachment = styled.div`
  display: flex;
  max-width: 250px;
  padding: 5px;
  margin: 0 0 5px 5px;
  font-size: 12px;
  background-color: ${colors.colorSecondary};
  align-items: center;

  > div {
    margin-right: 10px;
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
const NoHeight = styled.div`
  height: auto;
`;

export {
  PopoverButton,
  ConversationWrapper,
  RespondBoxStyled,
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
  MaskWrapper,
  NoHeight
};
