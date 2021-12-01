import React from 'react';
import dayjs from 'dayjs';

type Props = {
  messages: any;
};

export default function MessageList(props: Props) {
  const { messages } = props;

  const renderRow = (message: any) => {
    return (
      <li key={message._id}>
        {message.content} <br />
        {message.createdUser && message.createdUser.email}
        <br />
        <span>{dayjs(message.createdAt).format('lll')}</span>
      </li>
    );
  };

  return <ul>{messages.map(message => renderRow(message))}</ul>;
}
