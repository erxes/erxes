import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { IOpenRecordOptions, NEW_RECORD_ID, useSidePanel } from 'ui-modules';
import { PROJECT_CONTENT_TYPE } from '../constants/contentType';
import { TProjectDraft } from '../utils/projectDraft';
import { useCreateProject } from './useCreateProject';

export const useCreateProjectRecord = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { openNewRecord, replaceRecord } = useSidePanel();
  const { createProject, loading } = useCreateProject();
  const saving = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const openProjectDraft = (
    defaults: Partial<TProjectDraft> = {},
    options?: IOpenRecordOptions,
  ): void => {
    openNewRecord(
      PROJECT_CONTENT_TYPE,
      {
        ...defaults,
        teamIds: defaults.teamIds ?? (teamId ? [teamId] : undefined),
      },
      options,
    );
  };

  const createProjectRecord = async (draft: TProjectDraft): Promise<void> => {
    if (loading || saving.current) return;
    saving.current = true;
    try {
      const result = await createProject({
        variables: draft,
        update: (cache) => {
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' });
          if (draft.convertedFromId) {
            cache.evict({
              id: 'ROOT_QUERY',
              fieldName: 'getConvertedProject',
              args: { convertedFromId: draft.convertedFromId },
            });
          }
        },
      });
      const projectId = result.data?.createProject?._id;
      if (projectId && mounted.current) {
        replaceRecord(
          { contentType: PROJECT_CONTENT_TYPE, contentId: NEW_RECORD_ID },
          { contentType: PROJECT_CONTENT_TYPE, contentId: projectId },
        );
      }
    } finally {
      saving.current = false;
    }
  };

  return { openProjectDraft, createProjectRecord, loading };
};
