import { RecordTableInlineCell, useQueryState } from 'erxes-ui';

/** The campaign's name, and the way into its detail sheet. */
export const BroadcastNameCell = ({
  _id,
  title,
}: {
  _id?: string;
  title?: string;
}) => {
  const [, setMessageId] = useQueryState('messageId');

  return (
    <RecordTableInlineCell onClick={() => setMessageId(_id)}>
      {title}
    </RecordTableInlineCell>
  );
};
