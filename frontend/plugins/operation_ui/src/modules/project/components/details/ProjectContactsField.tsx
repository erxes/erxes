import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { ContactsRelationField } from 'ui-modules';

// The project's one customer or company, kept on the project itself.
export const ProjectContactsField = ({
  projectId,
  kind,
  label,
  value,
  variant = 'chip',
  scope = `project-detail.${projectId}`,
}: {
  projectId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: string | null;
  variant?: 'chip' | 'section';
  // Hotkey/popover scope prefix; each host passes its own to avoid collisions.
  scope?: string;
}) => {
  const { updateProject } = useUpdateProject();
  const field = kind === 'customer' ? 'customerId' : 'companyId';

  const fieldControl = (
    <ContactsRelationField
      kind={kind}
      variant={variant === 'section' ? 'inline' : 'chip'}
      label={variant === 'chip' ? label : undefined}
      value={value}
      scope={`${scope}.${kind}`}
      onValueChange={(id) =>
        updateProject({
          variables: { _id: projectId, [field]: id },
          // Contacts' project lists change with them.
          update: (cache) =>
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' }),
        })
      }
    />
  );

  if (variant === 'section') {
    return (
      <section className="border-b pt-1" aria-label={label}>
        <h3 className="flex h-10 items-center text-xs font-medium">{label}</h3>
        <div className="min-w-0 pb-2">{fieldControl}</div>
      </section>
    );
  }

  return fieldControl;
};
