import { useCompanyCell } from '@/contacts/hooks/useContactTableCell';
import { renderingCompanyDetailAtom } from '@/contacts/states/companyDetailStates';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import clsx from 'clsx';
import { RecordTableInlineCell, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { CompanyName, getCompanyDisplayName } from 'ui-modules';

export const CompanyNameCell = () => {
  const { cell } = useCompanyCell();
  const { primaryName, _id } = cell.row.original;
  const setRenderingCompanyDetail = useSetAtom(renderingCompanyDetailAtom);
  const [, setCompanyDetail] = useQueryState('companyId');
  return (
    <CompanyName
      primaryName={primaryName}
      _id={_id}
      scope={clsx(ContactsHotKeyScope.CompaniesPage, _id, 'Name')}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor
          onClick={() => {
            setRenderingCompanyDetail(true);
            setCompanyDetail(cell.row.original._id);
          }}
        >
          {primaryName || getCompanyDisplayName(cell.row.original)}
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
    </CompanyName>
  );
};
