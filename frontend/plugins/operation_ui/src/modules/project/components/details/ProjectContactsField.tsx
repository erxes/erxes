import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { ContactsRelationField } from 'ui-modules';

// The project's one customer or company, kept on the project itself.
export const ProjectContactsField = ({
  projectId,
  kind,
  label,
  value,
}: {
  projectId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: string | null;
}) => {
  const { updateProject } = useUpdateProject();
  const field = kind === 'customer' ? 'customerId' : 'companyId';

  return (
    <ContactsRelationField
      kind={kind}
      variant="chip"
      label={label}
      value={value}
      scope={`project-detail.${kind}`}
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
};
