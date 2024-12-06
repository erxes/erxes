import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import { __ } from "@erxes/ui/src/utils/core";
import React from "react";

type Props = {
  bot: any;
  remove: (_id: string) => void;
  repair: (_id: string) => void;
};

function Row({ bot, remove, repair }: Props) {
  return (
    <tr key={bot._id}>
      <td>{bot?.name || "-"}</td>
      <td>{bot?.account?.name || "-"}</td>
      <td>{bot?.page?.name || "-"}</td>
      <td>
        <ActionButtons>
          <Button
            href={`/settings/whatsapp-messenger-bot/edit/${bot._id}`}
            btnStyle='link'
            icon='edit-3'
          />
          <Button
            btnStyle='link'
            icon='redo'
            onClick={() => repair(bot._id)}
          />
          <Button
            btnStyle='link'
            icon='times'
            onClick={remove.bind(this, bot._id)}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
