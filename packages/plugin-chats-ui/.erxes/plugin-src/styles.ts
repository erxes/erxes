import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const MessageList = styled.ul`
  padding: 10px 20px;
  list-style: none;
`;

export const MessageListItem = styledTS<{ me: boolean }>(styled.li)`
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
  text-align: ${props => (props.me ? 'right' : 'left')}
`;

export const ChatListStyle = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;

  li {
    margin-left: 10px;
    padding: 0 10px 10px;
  }
`;
