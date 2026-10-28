import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { IField } from 'ui-modules';

export type TPropertyFieldActions = {
  addField: (groupId?: string) => void;
  editField: (field: Pick<IField, '_id' | 'groupId'>) => void;
};

export const PropertyFieldActionsContext =
  createContext<TPropertyFieldActions | null>(null);

export const usePropertyFieldActions = (
  contentType: string,
): TPropertyFieldActions => {
  const actions = useContext(PropertyFieldActionsContext);
  const { basePath } = usePropertiesScope();
  const navigate = useNavigate();

  if (actions) {
    return actions;
  }

  return {
    addField: (groupId) =>
      navigate(
        groupId
          ? `${basePath}/${contentType}/${groupId}/add`
          : `${basePath}/${contentType}/add`,
      ),
    editField: ({ _id, groupId }) =>
      navigate(`${basePath}/${contentType}/${groupId}/${_id}`),
  };
};
