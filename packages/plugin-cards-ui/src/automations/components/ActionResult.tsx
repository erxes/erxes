import React from 'react';
import { Link } from 'react-router-dom';

const ActionResult = ({ action, result }) => {
  const type = (action.actionType.substr(6) || '').split('.')[0].toLowerCase();

  return (
    <Link
      target="_blank"
      to={`/${type}/board?_id=${result.boardId}&itemId=${result.itemId}&key=&pipelineId=${result.pipelineId}`}
    >
      {`Created ${type}: ${result.name}`}
    </Link>
  );
};

export default ActionResult;
