import { Button } from 'modules/common/components';
import { confirm } from 'modules/common/utils';
import * as moment from 'moment';
import * as React from 'react';

type Props = {
  history?: any;
  removeHistory: (historyId: string) => void;
  onClick: (id: string) => void;
};

function HistoryRow({ history, removeHistory, onClick }: Props) {
  const { user = {} } = history;
  const { details = {} } = user;

  const onRemove = () =>
    confirm().then(() => {
      removeHistory(history._id);
    });

  const onRowClick = () => onClick(history._id);

  return (
    <tr onClick={onRowClick}>
      <td>{history.success || 0}</td>
      <td>{history.failed || 1}</td>
      <td>{history.total || 1}</td>
      <td>{moment(history.date).format('lll')}</td>
      <td>{details.fullName || '-'}</td>
      <td>
        <Button btnStyle="link" icon="cancel-1" onClick={onRemove} />
      </td>
    </tr>
  );
}

export default HistoryRow;
