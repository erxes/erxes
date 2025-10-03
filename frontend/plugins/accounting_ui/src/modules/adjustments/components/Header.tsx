import { AccountingHeader } from '@/layout/components/Header';
import { useNavigate, useParams } from 'react-router';
import { Select, } from 'erxes-ui';

export const adjustTypes = [
  { value: 'fundRate', label: 'Fund Rate' },
  { value: 'debRate', label: 'Debt Rate' },
  { value: 'inventory', label: 'inventories' },
  { value: 'fxa', label: 'fixedasset' }
]

export const AdjustmentHeader = ({ children, defaultKind }: { children?: React.ReactNode; defaultKind?: string }) => {
  const navigate = useNavigate();
  const params = useParams();
  const subTitle = defaultKind || params['*']?.replace('adjustment/', '');

  return (
    <AccountingHeader
      leftChildren={
        (<Select value={subTitle} onValueChange={(val) => navigate(`/accounting/adjustment/${val}`)}>
          <Select.Trigger>
            <Select.Value placeholder="Select a kind" />
          </Select.Trigger>
          <Select.Content>
            {adjustTypes.map((kind) => (
              <Select.Item key={kind.value} value={kind.value} className="capitalize">
                {kind.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>)
      }
      returnLink='/accounting/adjustment/inventory'
      returnText='Inventory'
    >
      {children}
    </AccountingHeader>
  );
};
