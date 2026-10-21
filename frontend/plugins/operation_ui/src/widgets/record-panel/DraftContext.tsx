import { TeamInline } from '@/team/components/TeamInline';
import { useTranslation } from 'react-i18next';
import { ContactRecordChip, PanelField, useSidePanel } from 'ui-modules';

// What a task or triage draft starts with, shown under its name.
export const DraftContext = ({
  teamId,
  customerIds = [],
  companyIds = [],
}: {
  teamId?: string;
  customerIds?: string[];
  companyIds?: string[];
}) => {
  const { t } = useTranslation('operation');
  const { openRecord } = useSidePanel();
  const contacts = [
    ...customerIds.map((id) => ({ kind: 'customer' as const, id })),
    ...companyIds.map((id) => ({ kind: 'company' as const, id })),
  ];

  return (
    <>
      {teamId && (
        <PanelField label={t('team')} cell={false}>
          <TeamInline teamId={teamId} className="h-7 px-2 font-normal" />
        </PanelField>
      )}
      {contacts.length > 0 && (
        <PanelField label={t('contacts', 'Contacts')} cell={false}>
          <div className="flex min-h-7 flex-wrap items-center gap-1 px-1">
            {contacts.map(({ kind, id }) => (
              <ContactRecordChip
                key={id}
                kind={kind}
                id={id}
                onOpen={() =>
                  openRecord(
                    {
                      contentType:
                        kind === 'customer' ? 'core:customer' : 'core:company',
                      contentId: id,
                    },
                    { stack: true },
                  )
                }
              />
            ))}
          </div>
        </PanelField>
      )}
    </>
  );
};
