import { Button, Input, Sheet } from 'erxes-ui';
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { IDeal } from '@/deals/types/deals';
import { useDealsContext } from '@/deals/context/DealContext';
import { useState } from 'react';
import { DealsActions } from '@/deals/actionBar/components/DealsActions';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();

  const [name, setName] = useState(deal?.name || 'Untitled deal');

  const handleName = () => {
    if (!deal || !name.trim()) return;

    if (name === deal.name) return;

    editDeals({
      variables: {
        _id: deal._id,
        name,
      },
    });
  };

  return (
    <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon">
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Sheet.Title className="flex-1 min-w-0">
        <Input
          className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
          placeholder="Deal Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={handleName}
        />
      </Sheet.Title>

      <div className="flex items-center gap-2 shrink-0">
        {deal?.status === 'archived' && (
          <span className="text-sm py-1 px-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-sm whitespace-nowrap ">
            Archived
          </span>
        )}
        <DealsActions deals={[deal]} />
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
