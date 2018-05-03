import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  history: PropTypes.object
};

function HistoryRow({ history }) {
  const { importedUser = {} } = history;
  const { details = {} } = importedUser;

  return (
    <tr>
      <td>{history.success || 0}</td>
      <td>{history.failed || 1}</td>
      <td>{history.total || 1}</td>
      <td>{history.importedDate || 1}</td>
      <td>{details.fullName || '-'}</td>
    </tr>
  );
}

HistoryRow.propTypes = propTypes;

export default HistoryRow;
