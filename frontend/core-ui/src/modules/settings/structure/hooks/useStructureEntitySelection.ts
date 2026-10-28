import { useQueryState } from 'erxes-ui';

export const STRUCTURE_ENTITY_PARAM = 'entity_id';

export const useStructureEntitySelection = () => {
  const [entityId, setEntityId] = useQueryState<string>(STRUCTURE_ENTITY_PARAM);

  return { entityId, setEntityId };
};
