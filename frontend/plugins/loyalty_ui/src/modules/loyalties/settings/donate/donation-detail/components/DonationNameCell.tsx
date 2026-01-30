import { useQueryState } from 'erxes-ui';
import { IDonation } from '../../types/donationTypes';

interface DonationNameCellProps {
  donation: IDonation;
  name: string;
}

export const DonationNameCell = ({ donation, name }: DonationNameCellProps) => {
  const [, setEditOpen] = useQueryState('editDonationId');

  return (
    <button
      type="button"
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(donation._id);
      }}
    >
      {name}
    </button>
  );
};
