import { Config, IUser } from '../../types';
import { Label, ListBody, ListHead, ListRow } from '../../styles/purchases';

import EmptyContent from '../../common/EmptyContent';
import React from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

type Props = {
  loading: boolean;
  purchases: any;
  currentUser: IUser;
  config: Config;
  type: string;
};

export default function Group({ purchases, currentUser, config, type }: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  if (!purchases || purchases.length === 0) {
    return <EmptyContent text="You don't have more purchases to view!" />;
  }

  return (
    <>
      <ListHead className="head">
        <div>Subject</div>
        <div>Start date</div>
        <div>Close date</div>
        <div>Created date</div>
        <div>Stage changed date</div>
        <div>Stage</div>
        <div>Labels</div>
      </ListHead>
      <ListBody>
        {(purchases || []).map(purchase => {
          const { stage = {}, labels } = purchase;

          return (
            <ListRow
              key={purchase._id}
              className="item"
              onClick={() => router.push(`/purchases?itemId=${purchase._id}`)}
            >
              <div className="base-color">{purchase.name}</div>

              <div>
                {purchase.startDate
                  ? dayjs(purchase.startDate).format('MMM D YYYY')
                  : '-'}
              </div>
              <div>
                {purchase.closeDate
                  ? dayjs(purchase.closeDate).format('MMM D YYYY')
                  : '-'}
              </div>
              <div>{dayjs(purchase.createdAt).format('MMM D YYYY')}</div>
              <div>
                {purchase.stageChangedDate
                  ? dayjs(purchase.stageChangedDate).format('MMM D YYYY')
                  : '-'}
              </div>

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
    </>
  );
}
