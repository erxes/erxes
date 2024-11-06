import React from 'react';
import { Link } from 'react-router-dom';

const ActionResult = ({ action, result }) => {
  return (
    <Link
      target="_blank"
      to={`/ticket/board?_id=${result.boardId}&itemId=${result.itemId}&key=&pipelineId=${result.pipelineId}`}
    >
      {`Created ticket: ${result.name}`}
    </Link>
  );
};

export default ActionResult;
