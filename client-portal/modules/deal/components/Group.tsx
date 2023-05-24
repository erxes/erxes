import { Config, IUser } from '../../types';
import { Label, ListBody, ListHead, ListRow } from '../../styles/deals';

import EmptyContent from '../../common/EmptyContent';
import React from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

type Props = {
  loading: boolean;
  deals: any;
  currentUser: IUser;
  config: Config;
  type: string;
};

export default function Group({ deals, currentUser, config, type }: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  if (!deals || deals.length === 0) {
    return <EmptyContent text="You don't have more deals to view!" />;
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
        {(deals || []).map(deal => {
          const { stage = {}, labels } = deal;

          return (
            <ListRow
              key={deal._id}
              className="item"
              onClick={() => router.push(`/deals?itemId=${deal._id}`)}
            >
              <div className="base-color">{deal.name}</div>

              <div>
                {deal.startDate
                  ? dayjs(deal.startDate).format('MMM D YYYY')
                  : '-'}
              </div>
              <div>
                {deal.closeDate
                  ? dayjs(deal.closeDate).format('MMM D YYYY')
                  : '-'}
              </div>
              <div>{dayjs(deal.createdAt).format('MMM D YYYY')}</div>
              <div>
                {deal.stageChangedDate
                  ? dayjs(deal.stageChangedDate).format('MMM D YYYY')
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
