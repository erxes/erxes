import { compactList } from '@/operation/utils/cursorList';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { ContactsRelationField } from 'ui-modules';

// The project's customers or companies, kept on the project itself.
export const ProjectContactsField = ({
  projectId,
  kind,
  label,
  value,
}: {
  projectId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: (string | null)[] | null;
}) => {
  const { updateProject } = useUpdateProject();
  const field = kind === 'customer' ? 'customerIds' : 'companyIds';

  return (
    <ContactsRelationField
      kind={kind}
      variant="chip"
      label={label}
      value={compactList(value)}
      scope={`project-detail.${kind}`}
      onValueChange={(ids) =>
        updateProject({
          variables: { _id: projectId, [field]: ids },
          // Contacts' project lists change with them.
          update: (cache) =>
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' }),
        })
      }
    />
  );
};
