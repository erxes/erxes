import styled, { keyframes, css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { darken, rgba } from '@erxes/ui/src/styles/ecolor';
import { isEnabled } from '@erxes/ui/src/utils/core';

/**
 * Global - START
 */
export const PageContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  textarea {
    background: #eff2f5;
  }
`;

export const SidebarWrapper = styled.div`
  height: calc(100% - 10px);
  overflow: hidden;
  overflow-y: auto;
  border-radius: 5px;
`;

export const SidebarHeader = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${dimensions.coreSpacing}px;
  background: #fff;
`;

export const IconButton = styled.button`
  display: inline-block;
  background-color: ${colors.bgActive};
  margin-left: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px 14px;
  border-radius: 100%;
  border: 0;
  outline: 0;  
  transition: 0.3s;

  &:hover {
    background-color: ${colors.colorCoreLightGray}
    transition: 0.3s;
    cursor: pointer;
  }
`;

export const VoiceRecordWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

export const RecordButton = styledTS<{ isRecording: boolean }>(styled.button)`
  background-color: ${props =>
    props.isRecording ? colors.colorShadowGray : 'none'};
  border-radius: 100%;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  transition: transform 0.3s ease-in-out;

  animation: ${props =>
    props.isRecording &&
    css`
      ${pulse} 1s infinite;
    `};
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
`;

export const Title = styled.h5`
  margin: 0;
  margin-bottom: 6px;
  padding: 0 ${dimensions.coreSpacing}px;
  color: ${colors.textSecondary};
`;

export const ChatActionItem = styled.button`
  display: inline-block;
  color: #444;
  background-color: ${colors.colorWhite};
  margin-left: ${dimensions.unitSpacing}px;
  padding: 0.4em 0.7em;
  border-radius: 100%;
  border: 0;
  outline: 0;
  transition: 0.3s;
  pointer-events: auto;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${colors.bgLight};
    transition: 0.3s;
    cursor: pointer;
  }
`;

export const ChatActions = styled.div`
  z-index: 1;
  display: none;

  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: 50%;
  transform: translateY(-50%);
`;
/**
 * Global - END
 */

/**
 * Widget - START
 */
export const WidgetButton = styled.div`
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

export const WidgetPopoverWrapper = styled.div`
  max-height: 500px !important;
  position: relative;
  padding: ${dimensions.coreSpacing}px 0;
  overflow-y: scroll;
`;

export const WidgetPopoverSeeAll = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid ${colors.borderPrimary};
  height: 30px;
  background-color: white;
  z-index: 9999;

  a {
    padding: 5px ${dimensions.coreSpacing}px;
    display: block;
    text-align: center;
  }
`;

export const WidgetChatWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 100px;
  display: flex;
  z-index: 5;
  justify-content: flex-end;
  align-content: flex-end;
  align-items: flex-end;
`;

export const WidgetChatWindowWrapper = styled.div`
  position: relative;
  width: 325px;
  height: 440px;
  margin-right: ${dimensions.unitSpacing}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
  border: 1px solid rgba(0, 0, 0, 0.08);

  -webkit-box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.1),
    0 2px 4px 0 rgba(0, 0, 0, 0.1);
  -moz-box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.1),
    0 2px 4px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

export const WidgetChatWindowHeader = styled.div`
  width: 100%;
  height: 58px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: ${dimensions.unitSpacing}px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 -1px rgba(0, 0, 0, 0.1) inset,
    0 2px 1px -1px rgba(255, 255, 255, 0.5) inset;

  i {
    cursor: pointer;
    margin-left: 3px;
  }

  &:first-child {
    flex: 1;
  }

  div {
    display: flex;
    align-items: center;

    p {
      display: inline-block;
      font-weight: 600;
      display: flex;
      margin: 0;
      margin-left: ${dimensions.unitSpacing}px;
      line-height: 15px;
      flex-direction: column;
      font-size: 16px;

      .name {
        height: 15px;
        max-width: 186px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }

      .position {
        color: #65676b;
        font-weight: 400;
        font-size: 0.75rem;
        height: 17px;
        overflow: hidden;
        text-overflow: ellipsis;
        align-items: baseline;
      }
    }
  }
`;

export const MinimizedWidgetChatWindow = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  margin-right: ${dimensions.coreSpacing}px;

  ${WidgetChatWindowHeader} {
    height: 40px;
    border-radius: 20px;
    width: 250px;
    cursor: pointer;

    p {
      max-width: 130px;
      font-size: 14px;
    }

    span:first-child {
      bottom: 2px;
      left: 0px;
    }

    span:last-child {
      top: 4px;
      right: 5px;
    }
  }
`;

export const MainPopoverWrapper = styled.div`
  cursor: pointer;
  padding: 0 15px;

  > div {
    padding: 5px 0;
  }

  i {
    margin-right: 5px;
  }
`;

export const MembersPopoverWrapper = styled.div`
  > button {
    margin-bottom: 10px;
    padding: 7px 15px;
  }
`;
/**
 * Widget - END
 */

/**
 * Chats - START
 */
export const ChatListSearch = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;

  input {
    background-color: white;
  }
`;

export const ChatListWrapper = styled.div`
  max-height: 100%;
  padding-left: 0;
  margin: 0;
  margin-bottom: 0.5em;
  z-index: 0;
`;

export const ChatItemWrapper = styledTS<{
  active?: boolean;
  isWidget?: boolean;
  isSeen?: boolean;
}>(styled.div)`
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${props =>
    props.isWidget && !props.isSeen
      ? '#edf2fa'
      : props.active
      ? '#f0eef9'
      : 'initial'};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-bottom: ${props =>
    props.isWidget && `1px solid ${colors.borderPrimary}`};
  transition: 0.2s;

  &:first-child {
    border-top: ${props =>
      props.isWidget && `1px solid ${colors.borderPrimary}`};
  }

  &:hover {
    background-color: ${colors.bgActive};
    cursor: pointer;
    transition: 0.2s;

    ${ChatActions} {
      display: inline-block;
    }
  }
  z-index: 0
`;

export const ChatGroupAvatar = styled.div`
  position: relative;
  min-width: 36px;
  max-width: 36px;
  height: 36px;

  span:first-child {
    position: absolute;
    bottom: -2px;
    left: -2px;
    border: 2px solid ${colors.bgActive};
    z-index: 2;
  }
  span:last-child {
    position: absolute;
    top: 0;
    right: 0;
  }
`;

export const ChatWrapper = styledTS<{ isSeen?: boolean }>(styled.div)`
  width: 100%;
  padding-left: ${dimensions.unitSpacing}px;
  margin: 0;
  color: ${colors.textPrimary};
  font-size: 14px !important;
  font-weight: ${props => (props.isSeen ? 'normal !important' : 'bold')};
  text-decoration: none;

  p { 
    margin: 0;
    height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;

    span {
      color: ${colors.textSecondary};
    }
  };
`;

export const ChatBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
`;

export const ChatContent = styled.p`
  max-width: 150px;
  max-height: 1rem;
  overflow: hidden;

  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-wrap: break-word;
  word-break: break-word;
`;

export const ChatTimestamp = styled.span`
  flex-shrink: 0;
  text-align: right;
`;

/**
 * Chats - END
 */

/**
 * Context Menu - START
 */
export const ContextMenuList = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-top;
  flex-direction: column;
  padding: 0.3em;
`;

export const ContextMenuItem = styledTS<{ color?: string }>(styled.button)`
  width: 100%;
  background-color: white;
  border: 0;
  outline: 0;
  border-radius: 5px;
  color: ${props => props.color || colors.textPrimary};
  padding: 5px 10px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${colors.bgActive};
  }
`;
/**
 * Context Menu - END
 */

/**
 * Participants - START
 */
export const ParticipantListWrapper = styledTS<{ isWidget?: boolean }>(
  styled.div
)`
  max-height: 100%;
  list-style: none;
  margin: 0;
  padding-left: 0;
  ${props =>
    props.isWidget &&
    `
    max-height: 280px;
    overflow: auto;
  `}
`;

export const ParticipantItemWrapper = styledTS<{ isWidget?: boolean }>(
  styled.div
)`
  position: relative;
  
  a {
    color: #444;
    display: flex;
    align-items: center;
    padding: ${props =>
      props.isWidget
        ? '7px 15px'
        : `${dimensions.unitSpacing}px ${dimensions.coreSpacing}px`};
    transition: 0.2s;

    i {
      background: ${colors.bgGray};
      border-radius: 50%;
      height: ${props => (props.isWidget ? '28px' : '36px')};
      width: ${props => (props.isWidget ? '28px' : '36px')};
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 10px;
    }
  }

  a:hover {
    background-color: ${colors.bgLight};
    transition: 0.2s;
  }

  &:hover {
    ${ChatActions} {
      display: inline-block;
    }
  }
`;

export const ParticipantDetails = styledTS<{ isWidget?: boolean }>(styled.div)`
  width: 100%;
  padding: 0 ${dimensions.unitSpacing}px;
  margin: 0;
  color: ${colors.textPrimary};
  text-decoration: none;
  ${props => props.isWidget && 'line-height: 14px;'}

  p {
    font-size: 14px;
    margin: 0;
  }
  span {
    font-size: 12px;
    ${props =>
      props.isWidget &&
      `
      height: 17px;
      display: flex;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
  }
`;

export const FlexColumn = styled.div`
  flex-direction: column;
`;
/**
 * Participants - END
 */

/**
 * UserDetails - START
 */
export const UserDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3em ${dimensions.coreSpacing}px;

  h3,
  span {
    margin-bottom: 0.2em;
    text-align: center;
  }
  hr {
    width: 100%;
    border-color: ${colors.colorShadowGray};
  }
`;

export const UserDetailsItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;

  & p:last-child {
    text-align: right;
  }
`;
/**
 * UserDetails - END
 */

/**
 * Messages - START
 */
export const MessageListWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  background-color: #f9f9f9;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow-y: scroll;
  overflow-x: hidden;
  list-style: none;
  padding: 0 ${dimensions.unitSpacing}px;
  margin: 0;
`;

export const MessageItemWrapper = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: ${props => (props.me ? 'flex-start' : 'flex-end')};
  flex-direction: ${props => (props.me ? 'row' : 'row-reverse')};
  margin: 2px;

  &:last-child {
    margin-top: auto;
  }
`;

export const MessageWrapper = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 560px;
  display: flex;
  align-items: ${props => (props.me ? 'flex-end' : 'flex-start')};
  justify-content: ${props => (props.me ? 'flex-end' : 'flex-start')};
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  margin-left: ${props => (!props.me ? dimensions.unitSpacing : 0)}px;
`;

export const MessageReply = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 100%;
  display: inline-block;
  font-size: 1em;
  color: ${colors.textSecondary};
  margin: 0;
  margin-top: 10px;
  line-height: 1.2em;
  
  b {
    font-weight: 500;
    font-size: 11px;
  }
  
  p {
    padding: 7px ${dimensions.unitSpacing}px;
    background-color: ${colors.bgUnread};
    border-radius: 10px;
    margin: 0;
    width: fit-content;
    ${props => (props.me ? `margin-left: auto;` : `margin-right: auto;`)}
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-wrap: break-word;
    word-break: break-word;
  }
`;

export const MessageOption = styled.button`
  background: none;
  display: none;
  border-radius: 100%;
  border: 0;
  outline: 0;
  cursor: pointer;
  margin: auto;

  &:hover {
    background-color: ${colors.bgGray};
  }
`;

export const MessageBody = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 560px;
  display: flex;
  gap: 5px;
  justify-content: ${props => (props.me ? 'flex-end' : 'flex-start')};
  align-items: ${props => (props.me ? 'flex-end' : 'flex-start')}
  flex-direction: ${props => (props.me ? 'row' : 'row-reverse')};

  &:hover {
    ${MessageOption} {
      display: inline-flex;
    }
  }
`;

export const MessageContent = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 205px;
  display: inline-block;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  border-radius: 17px;
  background-color: ${props =>
    props.me ? colors.colorPrimary : colors.bgGray};
  color: ${props => (props.me ? 'white' : 'initial')};
  padding: 8px 14px;
  margin: 0;
  font-size: 15px;
  line-height: 20px;

  p {
    margin: 0;
  }
`;

export const MessageAttachmentWrapper = styledTS<{ isWidget?: boolean }>(
  styled.div
)`
  max-width: 560px;
  height: auto;
  overflow: hidden;
  position: relative;

  & img {
    max-width: ${props => (props.isWidget ? '250px' : '300px')};
    height: ${props => (props.isWidget ? '200px' : '100%')};
    right: 0;
  }
`;

export const MessageBy = styled.div`
  color: #65676b;
  font-weight: 400;
  font-size: 11px;
`;
/**
 * Messages - END
 */

/**
 * ChatEditor - START
 */
export const ChatEditor = styled.div`
  width: 100%;
  background-color: #f9f9f9;
  padding: ${dimensions.unitSpacing}px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${dimensions.unitSpacing}px;

  label {
    margin-left: 10px;
    margin-bottom: 0px;
    display: block;

    &:first-child {
      margin: 0;
    }

    &:nth-child(3) {
      margin-right: 10px;
    }

    &:hover {
      cursor: pointer;
      color: ${darken(colors.colorCoreGray, 30)};
    }
  }

  i {
    margin: 0;
  }

  input[type='file'] {
    display: none;
  }
`;

export const ChatReplyInfo = styled.div`
  width: 100%;
  height: auto;
  display: block;
  overflow: hidden;
  font-size: ${dimensions.unitSpacing}px;
  color: ${colors.textSecondary};
  margin: 0;
  padding 1em;

  p {
    max-width: 560px;
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-wrap: break-word;
    word-break: break-word;
  }
`;

export const AttachmentIndicator = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  margin: ${dimensions.unitSpacing}px 0;
  color: ${rgba(colors.colorWhite, 0.7)};
`;

export const Attachment = styled.div`
  display: flex;
  max-width: 250px;
  padding: 5px;
  margin: 0 5px;
  font-size: 12px;
  background-color: ${colors.colorSecondary};
  align-items: center;

  &:first-child {
    margin-left: 0px;
  }

  > div {
    margin-right: 8px;
  }

  i {
    color: ${colors.colorWhite};
    opacity: 0.7;
    margin: 0 3px;
    font-size: 13px;
    transition: all ease 0.3s;

    &:hover {
      cursor: pointer;
      opacity: 1;
    }
  }
`;

export const AttachmentThumb = styled.div`
  margin-right: 5px;
`;

export const PreviewImg = styled.div`
  width: 26px;
  height: 26px;
  background-size: cover;
  background-position: 50%;
`;

export const FileName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 5px;
  color: ${colors.colorWhite};
`;

/**
 * ChatEditor - END
 */
