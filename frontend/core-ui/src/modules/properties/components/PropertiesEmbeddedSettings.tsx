import {
  PropertyFieldActionsContext,
  TPropertyFieldActions,
} from '@/properties/context/PropertyFieldActionsContext';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, IPropertyContentScope } from 'ui-modules';
import { AddProperty } from './PropertyAdd';
import { PropertyEdit } from './PropertyEdit';
import { PropertyFieldsGroupSettings } from './PropertyFieldsGroupSettings';
import { AddPropertyGroup } from './PropertyGroupAdd';

type TFieldSheet = { groupId?: string } | { fieldId: string };

export const PropertiesEmbeddedSettings = ({
  contentType,
  contentTypeId,
}: IPropertyContentScope) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [fieldSheet, setFieldSheet] = useState<TFieldSheet | null>(null);
  const closeFieldSheet = () => setFieldSheet(null);

  const actions = useMemo<TPropertyFieldActions>(
    () => ({
      addField: (groupId) => setFieldSheet({ groupId }),
      editField: ({ _id }) => setFieldSheet({ fieldId: _id }),
    }),
    [],
  );

  return (
    <PropertyFieldActionsContext.Provider value={actions}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-end gap-2">
          <AddPropertyGroup
            contentType={contentType}
            contentTypeId={contentTypeId}
          />
          <Can action="fieldsManage">
            <Button onClick={() => actions.addField()}>
              <IconPlus />
              {t('add-field', 'Add field')}
            </Button>
          </Can>
        </div>
        <PropertyFieldsGroupSettings
          contentType={contentType}
          contentTypeId={contentTypeId}
          className="m-0 max-w-none"
        />
      </div>
      {fieldSheet &&
        ('fieldId' in fieldSheet ? (
          <PropertyEdit
            contentType={contentType}
            contentTypeId={contentTypeId}
            fieldId={fieldSheet.fieldId}
            onClose={closeFieldSheet}
          />
        ) : (
          <AddProperty
            contentType={contentType}
            contentTypeId={contentTypeId}
            groupId={fieldSheet.groupId}
            onClose={closeFieldSheet}
          />
        ))}
    </PropertyFieldActionsContext.Provider>
  );
};
