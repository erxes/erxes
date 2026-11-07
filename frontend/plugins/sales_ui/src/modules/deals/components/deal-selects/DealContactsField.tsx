import { useDealsContext } from '@/deals/context/DealContext';
import { useOptionalFocusSheet } from 'erxes-ui';
import { ContactsRelationField, RELATION_CONTACT_SIDE_TABS } from 'ui-modules';

// The deal's customer or company, kept on the deal itself.
export const DealContactsField = ({
  dealId,
  kind,
  label,
  value,
  variant = 'chip',
}: {
  dealId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: string | null;
  variant?: 'inline' | 'chip';
}) => {
  const { editDeals } = useDealsContext();
  // The deal sheet is modal, so the app's side panel cannot show the
  // contact: it opens in the sheet's own Customers / Companies tab. Outside
  // a sheet (a notification) it opens in the side panel.
  const setActiveSideTab = useOptionalFocusSheet()?.setActiveSideTab;
  const field = kind === 'customer' ? 'customerId' : 'companyId';

  return (
    <ContactsRelationField
      kind={kind}
      variant={variant}
      label={label}
      value={value}
      scope={`deal-detail.${kind}`}
      onOpen={
        setActiveSideTab
          ? () => setActiveSideTab(RELATION_CONTACT_SIDE_TABS[kind])
          : undefined
      }
      onValueChange={(id) =>
        editDeals({
          variables: { _id: dealId, [field]: id },
          // Contacts' deal lists change with them.
          update: (cache) =>
            cache.modify({
              id: 'ROOT_QUERY',
              fields: {
                deals: (existing, { DELETE, storeFieldName }) =>
                  /"(customerId|companyId)":/.test(storeFieldName)
                    ? DELETE
                    : existing,
              },
            }),
        })
      }
    />
  );
};
