import { useRouter } from 'next/router';
import React from 'react';
import { ListHead, ListBody, ListRow, Label } from '../../styles/tickets';
import Detail from '../containers/Detail';
import { IUser } from '../../types';
import dayjs from 'dayjs';

type Props = {
  loading: boolean;
  tickets: any;
  currentUser: IUser;
};

export default function Ticket({ tickets, currentUser }: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  if (!tickets || tickets.length === 0) {
    return null;
  }

  return (
    <>
      <ListHead className="head">
        <div>Subject</div>
        <div>Created date</div>
        <div>Stage</div>
        <div>Labels</div>
      </ListHead>
      <ListBody>
        {tickets.map(ticket => {
          const { stage = {}, labels } = ticket;

          return (
            <ListRow
              key={ticket._id}
              className="item"
              onClick={() => router.push(`/tickets?itemId=${ticket._id}`)}
            >
              <div className="base-color">{ticket.name}</div>

              <div>{dayjs(ticket.createdAt).format('MMM D YYYY')}</div>

              <div className="base-color">{stage.name}</div>

              <div>
                {(labels || []).map(label => (
                  <Label
                    key={label._id}
                    lblStyle={'custom'}
                    colorCode={label.colorCode}
                  >
                    {label.name}
                  </Label>
                ))}
              </div>
            </ListRow>
          );
        })}
      </ListBody>

      {itemId && (
        <Detail
          _id={itemId}
          onClose={() => router.push('/tickets')}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
