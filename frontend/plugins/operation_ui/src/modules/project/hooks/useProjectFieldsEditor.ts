import { useBlockEditor } from 'erxes-ui';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { type Block } from '@blocknote/core';
import { useGetProject } from '@/project/hooks/useGetProject';
import { parseDescriptionBlocks } from '@/operation/utils/parseDescriptionBlocks';
import { compactList } from '@/operation/utils/cursorList';
import type {
  ProjectFieldsEditorOptions,
  ProjectFieldsEditorState,
} from '@/project/types/projectFields';

export const useProjectFieldsEditor = ({
  projectId,
  descriptionPlaceholder,
}: ProjectFieldsEditorOptions): ProjectFieldsEditorState => {
  const { project } = useGetProject(projectId);

  const { icon, memberIds, name: _name, description } = project || {};

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(parseDescriptionBlocks(description));
  const editor = useBlockEditor({
    initialContent: descriptionContent?.length ? descriptionContent : undefined,
    placeholder: descriptionPlaceholder,
  });
  const { updateProject } = useUpdateProject();

  const memberIdList = memberIds ? compactList(memberIds) : [];

  const [name, setName] = useState(_name);
  const [localMemberIds, setLocalMemberIds] = useState<string[]>(memberIdList);
  const [debouncedMemberIds] = useDebounce(localMemberIds, 1000);
  const serverMemberIdsString = JSON.stringify(memberIdList);

  useEffect(() => {
    const currentServerIds = JSON.stringify(memberIdList);
    const currentDebouncedIds = JSON.stringify(debouncedMemberIds);
    const currentLocalIds = JSON.stringify(localMemberIds);

    if (
      currentDebouncedIds !== currentServerIds &&
      currentLocalIds !== currentServerIds
    ) {
      updateProject({
        variables: { _id: projectId, memberIds: debouncedMemberIds },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMemberIds]);

  useEffect(() => {
    const currentLocalIds = JSON.stringify(localMemberIds);
    const currentDebouncedIds = JSON.stringify(debouncedMemberIds);

    if (
      currentLocalIds === currentDebouncedIds &&
      currentLocalIds !== serverMemberIdsString
    ) {
      setLocalMemberIds(memberIdList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverMemberIdsString]);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };
  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);
  useEffect(() => {
    if (!debouncedName || debouncedName === _name) return;
    updateProject({
      variables: {
        _id: projectId,
        name: debouncedName,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  useEffect(() => {
    if (!debouncedDescriptionContent) return;
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(parseDescriptionBlocks(description))
    ) {
      return;
    }
    updateProject({
      variables: {
        _id: projectId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);

  const handleIconChange = (nextIcon: string | null): void => {
    if (nextIcon !== icon) {
      updateProject({ variables: { _id: projectId, icon: nextIcon } });
    }
  };
  const handleTagsChange = (newTagIds: string | string[]): void => {
    updateProject({
      variables: {
        _id: projectId,
        tagIds: Array.isArray(newTagIds) ? newTagIds : [newTagIds],
      },
    });
  };

  return {
    project,
    editor,
    name,
    setName,
    localMemberIds,
    setLocalMemberIds,
    handleDescriptionChange,
    handleIconChange,
    handleTagsChange,
  };
};
