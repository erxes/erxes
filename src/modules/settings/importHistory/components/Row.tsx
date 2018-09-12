import { Button } from 'modules/common/components';
import { confirm } from 'modules/common/utils';
import moment from 'moment';
import * as React from 'react';

type Props = {
  history?: any,
  removeHistory: (_id: string) => void
};

function HistoryRow({ history, removeHistory }: Props) {
  const { user = {} } = history;
  const { details = {} } = user;

  return (
    <tr>
      <td>{history.success || 0}</td>
      <td>{history.failed || 1}</td>
      <td>{history.total || 1}</td>
      <td>{moment(history.date).format('lll')}</td>
      <td>{details.fullName || '-'}</td>
      <td>
        <Button
          btnStyle="link"
          icon="cancel-1"
          onClick={() =>
            confirm().then(() => {
              removeHistory(history._id);
            })
          }
        />
      </td>
    </tr>
  );
}

export default HistoryRow;
