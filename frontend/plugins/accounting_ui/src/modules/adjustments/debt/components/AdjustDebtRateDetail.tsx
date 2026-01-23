import { IconTrashX, IconEdit } from '@tabler/icons-react';
import { Button, Spinner, useQueryState } from 'erxes-ui';
import { useAdjustDebtRateRemove } from '../hooks/useAdjustDebtRateChange';
import { useAdjustDebtRateDetail } from '../hooks/useAdjustDebtRateDetail';
import dayjs from 'dayjs';
import { useState } from 'react';
import { EditAdjustDebtRate } from './AdjustDebtRateForm';

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

export const AdjustDebtRateDetail = () => {
  const [id] = useQueryState<string>('id');
  const [editOpen, setEditOpen] = useState(false);

  const { adjustDebtRate, loading } = useAdjustDebtRateDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { removeAdjustDebtRate, loading: removeLoading } =
    useAdjustDebtRateRemove();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!id || !adjustDebtRate) {
    return <div className="p-6">Adjust Debt Rate not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this adjustment?')) {
      removeAdjustDebtRate({
        variables: { adjustDebtRateIds: [id] },
      });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Debt Rate Adjustment</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <IconEdit size={16} />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={handleDelete}
              disabled={removeLoading}
            >
              <IconTrashX size={16} />
              Delete
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          <DetailField
            label="Date"
            value={dayjs(adjustDebtRate.date).format('YYYY-MM-DD')}
          />
          <DetailField label="Currency" value={adjustDebtRate.currency} />
          <DetailField
            label="Spot Rate"
            value={adjustDebtRate.spotRate?.toFixed(4) || '-'}
          />
          <DetailField
            label="Main Currency"
            value={adjustDebtRate.mainCurrency}
          />
          <DetailField
            label="Customer Type"
            value={adjustDebtRate.customerType || 'All'}
          />
          {adjustDebtRate.customerId && (
            <DetailField
              label="Customer ID"
              value={adjustDebtRate.customerId}
            />
          )}
          {adjustDebtRate.branchId && (
            <DetailField label="Branch" value={adjustDebtRate.branchId} />
          )}
          {adjustDebtRate.departmentId && (
            <DetailField
              label="Department"
              value={adjustDebtRate.departmentId}
            />
          )}
          <DetailField
            label="Gain Account"
            value={adjustDebtRate.gainAccountId}
          />
          <DetailField
            label="Loss Account"
            value={adjustDebtRate.lossAccountId}
          />
          {adjustDebtRate.description && (
            <div className="col-span-2">
              <DetailField
                label="Description"
                value={adjustDebtRate.description}
              />
            </div>
          )}
        </div>

        {adjustDebtRate.details && adjustDebtRate.details.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Account Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Account</th>
                    <th className="text-right p-3 font-medium">Main Balance</th>
                    <th className="text-right p-3 font-medium">
                      Currency Balance
                    </th>
                    <th className="text-center p-3 font-medium">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustDebtRate.details.map((detail: any) => (
                    <tr key={detail._id} className="border-b">
                      <td className="p-3">{detail.accountId}</td>
                      <td className="p-3 text-right font-mono">
                        {detail.mainBalance?.toLocaleString() || '-'}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {detail.currencyBalance?.toLocaleString() || '-'}
                      </td>
                      <td className="p-3 text-center text-sm text-muted-foreground">
                        {detail.transactionId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editOpen && (
        <EditAdjustDebtRate
          open={editOpen}
          setOpen={setEditOpen}
          adjustDebtRate={adjustDebtRate}
        />
      )}
    </div>
  );
};
