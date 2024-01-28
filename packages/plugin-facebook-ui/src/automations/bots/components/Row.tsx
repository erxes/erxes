import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  bot: any;
  remove: (_id: string) => void;
};

function Row({ bot, remove }: Props) {
  return (
    <tr key={bot._id}>
      <td>{__(bot?.name || '-')}</td>
      <td>{__(bot?.account?.name || '-')}</td>
      <td>{__(bot?.page?.name || '-')}</td>
      <td>
        <ActionButtons>
          <Button
            href={`/settings/facebook-messenger-bot/edit/${bot._id}`}
            btnStyle="link"
            icon="edit-3"
          />
          <Button
            btnStyle="link"
            icon="times-circle"
            onClick={remove.bind(this, bot._id)}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
