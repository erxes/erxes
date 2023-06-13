import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { darken, rgba } from '@erxes/ui/src/styles/ecolor';

/**
 * Global - START
 */
export const PageContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const SidebarWrapper = styled.div`
  height: calc(100% - 10px);
  background-color: ${colors.bgActive};
  overflow: hidden;
  overflow-y: auto;
  border-radius: 5px;
`;

export const SidebarHeader = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: ${colors.bgActive};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${dimensions.coreSpacing}px;
`;

export const IconButton = styled.button`
  display: inline-block;
  background-color: ${colors.colorShadowGray};
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

export const Title = styled.h5`
  margin: 0;
  margin-bottom: 6px;
  padding: 0 ${dimensions.coreSpacing}px;
  color: ${colors.textSecondary};
`;

export const ChatActions = styled.div`
  z-index: 1;
  visibility: hidden;

  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: 50%;
  transform: translateY(-50%);
`;

export const ChatActionItem = styled.button`
  display: inline-block;
  color: white;
  background-color: ${colors.colorPrimary};
  margin-left: ${dimensions.unitSpacing}px;
  padding: 0.4em 0.7em;
  border-radius: 100%;
  border: 0;
  outline: 0;
  transition: 0.3s;
  pointer-events: auto;

  &:hover {
    background-color: ${colors.colorPrimaryDark}
    transition: 0.3s;
    cursor: pointer;
  }
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
  right: 0;
  display: flex;
  z-index: 9999;
  justify-content: flex-end;
  align-content: flex-end;
`;

export const WidgetChatWindowWrapper = styled.div`
  position: relative;
  width: 350px;
  height: 400px;
  margin: 0 ${dimensions.coreSpacing / 2}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  border-radius: 5px;
  overflow: hidden;
  background-color: #f9f9f9;

  -webkit-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 0px 0px 5px 0px rgba(0, 0, 0.5);
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
`;

export const WidgetChatWindowHeader = styled.div`
  width: 100%;
  height: 75px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: ${dimensions.unitSpacing}px;
  border-bottom: 2px solid ${colors.borderPrimary};

  i {
    cursor: pointer;
    margin: 0 ${dimensions.unitSpacing}px;
  }
  div {
    display: flex;
    align-items: center;

    p {
      display: inline-block;
      font-weight: bold;
      display: flex;
      align-items: center;
      margin: 0;
      margin-left: ${dimensions.unitSpacing}px;
    }
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
      ? colors.bgGray
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
    background-color: ${props =>
      props.isWidget ? colors.bgLight : colors.bgGray};
    cursor: pointer;
    transition: 0.2s;
  }
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

  p { margin: 0 };
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
  padding: 0.5em;
`;

export const ContextMenuItem = styledTS<{ color?: string }>(styled.button)`
  width: 100%;
  background-color: white;
  border: 0;
  outline: 0;
  border-radius: 5px;
  color: ${props => props.color || colors.textPrimary};
  padding: 1em;
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
export const ParticipantListWrapper = styled.div`
  max-height: 100%;
  list-style: none;
  margin: 0;
  padding-left: 0;
`;

export const ParticipantItemWrapper = styled.div`
  position: relative;

  a {
    display: flex;
    align-items: center;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
    transition: 0.2s;
  }

  a:hover {
    background-color: ${colors.bgGray};
    transition: 0.2s;
  }
`;

export const ParticipantDetails = styled.div`
  width: 100%;
  padding: 0 ${dimensions.unitSpacing}px;
  margin: 0;
  color: ${colors.textPrimary};
  text-decoration: none;

  p {
    font-size: 14px;
    margin: 0;
  }
  span {
    font-size: 12px;
  }
`;

export const ParticipantSubDetails = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
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

export const MessageReply = styled.div`
  max-width: 100%;
  display: inline-block;

  font-size: 0.8em;
  color: ${colors.textSecondary};
  background-color: ${colors.bgUnread}
  border-radius: 5px;
  padding: 2px ${dimensions.unitSpacing}px 2px;
  margin: 0;

  p {
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-wrap: break-word;
    word-break: break-word;
  }
`;

export const MessageBody = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 560px;
  display: flex;
  justify-content: ${props => (props.me ? 'flex-end' : 'flex-start')};
  align-items: ${props => (props.me ? 'flex-end' : 'flex-start')}
  flex-direction: ${props => (props.me ? 'row' : 'row-reverse')};
`;

export const MessageContent = styledTS<{ me?: boolean }>(styled.div)`
  max-width: 100%;
  display: inline-block;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;

  border-radius: 5px;
  background-color: ${props =>
    props.me ? colors.colorPrimary : colors.bgGray};
  color: ${props => (props.me ? 'white' : 'initial')};
  padding: 8px;
  margin: 0;

  p {
    margin: 0;
  }
`;

export const MessageOption = styled.button`
  background: none;
  display: inline-block;
  visibility: hidden;
  border-radius: 100%;
  border: 0;
  outline: 0;
  cursor: pointer;
  margin: auto ${dimensions.unitSpacing}px;

  &:hover {
    background-color: ${colors.bgGray};
  }
`;

export const MessageAttachmentWrapper = styled.div`
  max-width: 560px;
  height: auto;
  overflow: hidden;
  position: relative;

  & img {
    width: 100%;
    height: auto;
    object-fit: contain;
    right: 0;
  }
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
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  label {
    margin: 0 10px;
    display: block;

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
