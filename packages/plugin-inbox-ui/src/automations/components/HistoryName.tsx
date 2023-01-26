import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  target: any;
};

const HistoryName = ({ target }: Props) => {
  let title: string = target.content || 'Conversation';

  title = title.length > 100 ? `${title.substring(0, 200)}...` : title;

  return (
    <Link target="_blank" to={`/inbox/index?_id=${target._id}`}>
      {title}
    </Link>
  );
};

export default HistoryName;
