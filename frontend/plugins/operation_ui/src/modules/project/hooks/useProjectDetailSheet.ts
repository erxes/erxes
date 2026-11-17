import { useCallback } from 'react';
import { IOpenRecordOptions, useSidePanel } from 'ui-modules';
import { PROJECT_CONTENT_TYPE } from '../constants/contentType';

export const useProjectDetailSheet = () => {
  const { record, openRecord, close } = useSidePanel();
  const activeProject =
    record?.contentType === PROJECT_CONTENT_TYPE ? record.contentId : null;
  const setActiveProject = useCallback(
    (projectId: string | null, options?: IOpenRecordOptions): void => {
      if (projectId) {
        openRecord(
          { contentType: PROJECT_CONTENT_TYPE, contentId: projectId },
          options,
        );
      } else if (activeProject) {
        close();
      }
    },
    [activeProject, openRecord, close],
  );

  return [activeProject, setActiveProject] as const;
};
