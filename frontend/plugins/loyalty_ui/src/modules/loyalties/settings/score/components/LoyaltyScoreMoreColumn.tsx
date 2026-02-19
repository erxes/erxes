import { CellContext } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { loyaltyScoreDetailAtom } from '../states/loyaltyScoreRowStates';

export const LoyaltyScoreMoreColumnCell = (
  props: CellContext<any, unknown>,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setLoyaltyScoreDetail = useSetAtom(loyaltyScoreDetailAtom);
  const { _id } = props.row.original;

  const setOpen = (scoreId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('score_id', scoreId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setLoyaltyScoreDetail(null);
      }}
    />
  );
};

export const loyaltyScoreMoreColumn = {
  id: 'more',
  cell: LoyaltyScoreMoreColumnCell,
  size: 33,
} as const;
