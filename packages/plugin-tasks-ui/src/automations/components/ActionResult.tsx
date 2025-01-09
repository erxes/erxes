import React from 'react';
import { Link } from 'react-router-dom';

const ActionResult = ({ result }) => {
  return (
    <Link
      target="_blank"
      to={`/task/board?_id=${result.boardId}&itemId=${result.itemId}&key=&pipelineId=${result.pipelineId}`}
    >
      {`Created task: ${result.name}`}
    </Link>
  );
};

export default ActionResult;
