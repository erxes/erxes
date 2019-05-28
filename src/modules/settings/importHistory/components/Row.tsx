import { Button, TextInfo, Tip } from 'modules/common/components';
import { __, confirm } from 'modules/common/utils';
import { Date } from 'modules/customers/styles';
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
      {withClick(<Date>{moment(history.date).format('lll')}</Date>)}
      <td>{details.fullName || '-'}</td>
      <td>
        <Tip text={__('Remove contacts')}>
          <Button
            size="small"
            btnStyle="warning"
            icon="removeuser"
            onClick={onRemove}
          />
        </Tip>
      </td>
    </tr>
  );
}

export default HistoryRow;
