import { IconCalculator, IconTrashX, IconEdit } from '@tabler/icons-react';
import { Button, Spinner, useQueryState } from 'erxes-ui';
import { useAdjustFundRateRemove } from '../hooks/useAdjustFundRateRemove';
import { useAdjustFundRateDetail } from '../hooks/useAdjustFundRateDetail';
import dayjs from 'dayjs';
import { useState } from 'react';
import { EditAdjustFundRate } from './AdjustFundRateForm';
import { useAdjustFundRateRun } from '../hooks/useAdjustFundRateRun';
import type { IAdjustFundRateDetail } from '../types/AdjustFundRate';

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

const formatAmount = (amount?: number) =>
  typeof amount === 'number' ? amount.toLocaleString() : '-';

export const AdjustFundRateDetail = () => {
  const [id] = useQueryState<string>('id');
  const [editOpen, setEditOpen] = useState(false);

  const { adjustFundRate, loading } = useAdjustFundRateDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { removeAdjustFundRate, loading: removeLoading } =
    useAdjustFundRateRemove();
  const { runAdjustFundRate, loading: runLoading } = useAdjustFundRateRun(
    id || '',
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!id || !adjustFundRate) {
    return <div className="p-6">Adjust Fund Rate not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this adjustment?')) {
      removeAdjustFundRate({ variables: { adjustFundRateIds: [id] } });
    }
  };

  const handleRun = () => {
    runAdjustFundRate();
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Fund Rate Adjustment</h2>
          <div className="flex gap-2">
            <Button onClick={handleRun} disabled={runLoading}>
              {runLoading ? <Spinner /> : <IconCalculator size={16} />}
              Calculate
            </Button>
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
            value={dayjs(adjustFundRate.date).format('YYYY-MM-DD')}
          />
          <DetailField label="Currency" value={adjustFundRate.currency} />
          <DetailField
            label="Spot Rate"
            value={adjustFundRate.spotRate?.toFixed(4) || '-'}
          />
          <DetailField
            label="Main Currency"
            value={adjustFundRate.mainCurrency}
          />
          {adjustFundRate.branchId && (
            <DetailField label="Branch" value={adjustFundRate.branchId} />
          )}
          {adjustFundRate.departmentId && (
            <DetailField
              label="Department"
              value={adjustFundRate.departmentId}
            />
          )}
          <DetailField
            label="Gain Account"
            value={adjustFundRate.gainAccountId}
          />
          <DetailField
            label="Loss Account"
            value={adjustFundRate.lossAccountId}
          />
          {adjustFundRate.description && (
            <div className="col-span-2">
              <DetailField
                label="Description"
                value={adjustFundRate.description}
              />
            </div>
          )}
        </div>

        {adjustFundRate.details && adjustFundRate.details.length > 0 && (
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
                    <th className="text-right p-3 font-medium">Difference</th>
                    <th className="text-center p-3 font-medium">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustFundRate.details.map(
                    (detail: IAdjustFundRateDetail) => (
                      <tr key={detail._id} className="border-b">
                        <td className="p-3">
                          <div className="font-medium">
                            {detail.accountCode || detail.accountId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {detail.accountName || '-'}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatAmount(detail.mainBalance)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatAmount(detail.currencyBalance)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatAmount(detail.diff)}
                        </td>
                        <td className="p-3 text-center text-sm text-muted-foreground">
                          {detail.transactionId || '-'}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {(!adjustFundRate.details || adjustFundRate.details.length === 0) && (
          <div className="p-6 border-t text-sm text-muted-foreground">
            No calculated account balances yet.
          </div>
        )}
      </div>

      {editOpen && (
        <EditAdjustFundRate
          open={editOpen}
          setOpen={setEditOpen}
          adjustFundRate={adjustFundRate}
        />
      )}
    </div>
  );
};
