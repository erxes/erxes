import { TStructureTreeEntity } from '../types/structureEntity';

export const STRUCTURE_ARCHIVED_STATUS = 'archived';

export const isStructureEntityArchived = ({
  status,
}: Pick<TStructureTreeEntity, 'status'>) =>
  status === STRUCTURE_ARCHIVED_STATUS;
