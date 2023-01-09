import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '@erxes/ui/src/styles';

export const SidebarWrapper = styled.div`
  height: calc(100% - 10px);
  background-color: ${colors.bgActive};
  padding: 0px 1em;
  overflow: hidden;
  overflow-y: auto;
  border-radius: 10px;
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
  padding: 0px 10px;
`;

export const IconButton = styled.button`
  display: inline-block;
  background-color: ${colors.colorShadowGray};
  margin-left: 10px;
  padding: 10px 14px;
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

export const Subtitle = styled.h5`
  padding: 0px 10px;
  margin: 0;
  margin-bottom: 6px;
  color: ${colors.textSecondary};
`;

// OptionMenu
export const OptionsWrapper = styled.div`
  position: absolute;
  z-index: 1001;
  display: none;
  top: 100px;
  left: 100px;
  width: auto;
  height: auto;
  background-color: white;
  box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 0.5em;
`;

export const OptionsList = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-top;
  flex-direction: column;
`;

export const OptionsItem = styled.button`
  width: 100%;
  background-color: white;
  border: 0;
  outline: 0;
  border-radius: 10px;
  padding: 1em;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${colors.bgActive};
  }
`;

export const OptionButton = styled.button`
  display: inline-block;
  color: white;
  background-color: ${colors.colorPrimary};
  margin-left: 10px;
  padding: 0.1em 0.4em;
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

// Chat Contacts
export const ContactsList = styled.ul`
  max-height: 100%;
  list-style: none;
  margin: 0;
  padding-left: 0;

  li {
    position: relative;
  }

  li a {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 10px;
    transition: 0.2s;
  }

  li a:hover {
    background-color: ${colors.bgGray};
    transition: 0.2s;
  }
`;

export const ContactsItem = styledTS<{ isSeen?: boolean }>(styled.div)`
  width: 100%;
  padding: 0px 10px;
  margin: 0;
  color: ${colors.textPrimary};
  font-size: 14px;
  font-weight: ${props => (props.isSeen ? 'initial' : 'bold')}
  text-decoration: none;
`;

export const ContactsGroupAvatar = styled.div`
  width: auto;
`;

export const ContactsItemPreview = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
`;

export const ContactsItemOptions = styled.div`
  z-index: 1000;
  display: none;

  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
`;

export const ContactsItemContent = styledTS<{ truncate?: boolean }>(
  styled.span
)`
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  flex-grow: 0;
  text-overflow: ${props => (props.truncate ? 'ellipsis' : 'initial')};
`;

export const ContactsItemDate = styled.span`
  flex-shrink: 0;
  text-align: right;
`;

// Participants
export const ParticipantList = styled.ul`
  max-height: 100%;
  list-style: none;
  margin: 0;
  padding-left: 0;

  li a {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 10px;
    transition: 0.2s;
  }

  li a:hover {
    background-color: ${colors.bgGray};
    transition: 0.2s;
  }
`;

export const ParticipantItem = styled.div`
  width: 100%;
  padding: 0px 10px;
  margin: 0;
  color: ${colors.textPrimary};
  font-size: 14px;
  text-decoration: none;
`;

export const ParticipantItemPreview = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

// Chat Content
export const ChatContentList = styled.ul`
  width: 100%;
  height: calc(100% - 180px);
  background-color: #f9f9f9;
  border-radius: 10px;
  overflow-y: scroll;
  list-style: none;
  padding: 20px 10px;
  margin: 0;
`;

export const ChatContentItem = styledTS<{ me: boolean }>(styled.li)`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: ${props => (props.me ? 'flex-start' : 'flex-end')};
  flex-direction: ${props => (props.me ? 'row' : 'row-reverse')};
  margin-bottom: 10px;
`;

export const ChatContentDate = styled.span`
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`;

export const ChatContentBody = styled.p`
  max-width: 560px;
  word-wrap: break-word;
  display: inline-block;
  border-radius: 10px;
  background-color: ${colors.bgGray};
  padding: 8px;
  margin: 0px 10px;
`;

export const ChatForm = styled.div`
  max-height: 180px;
  padding: 20px;
  width: 100%;
  position: absolute;
  bottom: 0px;

  textarea {
    max-height: 80px;
    border: 0;
    overflow-y: auto;
  }
`;

// Direct Info
export const DirectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 3em 0;

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

export const DirectDetailItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
`;
