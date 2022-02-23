import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import { DateWrapper } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import React from 'react';

type Props = {
  history?: any;
  removeHistory: (historyId: string) => void;
  onClick: (id: string) => void;
};

function HistoryRow({ history, removeHistory, onClick }: Props) {
  const { user = {} } = history;
  const { details = {} } = user || {};

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
      {withClick(
        <DateWrapper>{dayjs(history.date).format('lll')}</DateWrapper>
      )}
      <td>{details.fullName || '-'}</td>
      <td>
        <Tip text={__('Remove contacts')}>
          <Button
            size="small"
            btnStyle="warning"
            icon="user-minus"
            onClick={onRemove}
          />
        </Tip>
      </td>
    </tr>
  );
}

export default HistoryRow;
