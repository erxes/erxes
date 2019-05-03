import { Button, TextInfo } from 'modules/common/components';
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

  const withClick = (children: React.ReactNode) => {
    return <td onClick={onRowClick}>{children}</td>;
  };

  return (
    <tr>
      {withClick(
        <TextInfo textStyle="success">{history.success || 0}</TextInfo>
      )}
      {withClick(<TextInfo textStyle="danger">{history.failed || 1}</TextInfo>)}
      {withClick(<TextInfo>{history.total || 1}</TextInfo>)}
      {withClick(moment(history.date).format('lll'))}
      <td>{details.fullName || '-'}</td>
      <td>
        <Button btnStyle="link" icon="cancel-1" onClick={onRemove} />
      </td>
    </tr>
  );
}

export default HistoryRow;
