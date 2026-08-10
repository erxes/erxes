import { useQueryState } from 'erxes-ui';
import { AddCompanyForm as AddCompanyFormBase } from 'ui-modules';

export function AddCompanyForm({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const [, setCompanyId] = useQueryState('companyId');

  return (
    <AddCompanyFormBase
      onOpenChange={(open) => onOpenChange?.(open)}
      onSuccess={(id: string) => {
        setCompanyId(id);
      }}
    />
  );
}
