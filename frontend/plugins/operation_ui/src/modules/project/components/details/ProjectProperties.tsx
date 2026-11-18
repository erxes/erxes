import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { isRecord } from '@/operation/utils/isRecord';
import { PROJECT_CONTENT_TYPE } from '@/project/constants/contentType';
import { useProjectCustomFieldEdit } from '@/project/hooks/useProjectCustomFieldEdit';
import type { IProjectDetail } from '@/project/types';

export const ProjectProperties = ({ project }: { project: IProjectDetail }) => (
  <PropertiesSidePanel
    contentType={PROJECT_CONTENT_TYPE}
    contentId={project._id}
    propertiesData={
      isRecord(project.propertiesData) ? project.propertiesData : undefined
    }
    mutateHook={useProjectCustomFieldEdit}
  />
);
