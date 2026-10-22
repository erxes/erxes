import { useState } from 'react';
import { IconChevronRight, IconCode } from '@tabler/icons-react';
import { AlertDialog, Button, Collapsible, Sheet } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { DATA_MODEL_FIELD_ARCHIVE, DATA_MODEL_FIELD_RESTORE } from '../graphql';
import { useDataModelFields, useDataModelMutation } from '../hooks';
import { modelFieldSelection } from '../recordDocuments';
import { modelPath, type DataModel, type ModelField } from '../types';
import { DataModelFieldForm } from './DataModelFieldForm';
import {
  DataModelFieldSection,
  dataModelDisplayFieldType,
  type DataModelDisplayField,
} from './DataModelFieldSection';

export const DataModelFields = ({ model }: { model: DataModel }) => {
  const [relationsArchived, setRelationsArchived] = useState(false);
  const [fieldsArchived, setFieldsArchived] = useState(false);
  const relationsResult = useDataModelFields(model._id, relationsArchived);
  const fieldsResult = useDataModelFields(model._id, fieldsArchived);
  const [editor, setEditor] = useState<{
    field?: ModelField;
    initialType?: 'text' | 'relation';
  } | null>(null);
  const [lifecycle, setLifecycle] = useState<ModelField | null>(null);
  const [inspecting, setInspecting] = useState<DataModelDisplayField | null>(
    null,
  );
  const selection = fieldsResult.fields
    .filter((field) => !field.archivedAt)
    .slice(0, 6)
    .map(modelFieldSelection)
    .join('\n      ');
  const sample = `query dataModelsUi_${model.name}Example {\n  dataModel_${model.name}List {\n    list {\n      _id\n      ${selection}\n    }\n  }\n}`;
  const sectionActions = {
    onEdit: (field: ModelField) => setEditor({ field }),
    onInspect: (field: DataModelDisplayField) => {
      if (field.custom) setInspecting(field);
    },
    onRestore: setLifecycle,
  };
  return (
    <div className="space-y-8">
      <DataModelFieldSection
        model={model}
        kind="relations"
        result={relationsResult}
        archived={relationsArchived}
        onArchivedChange={setRelationsArchived}
        onCreate={() => setEditor({ initialType: 'relation' })}
        {...sectionActions}
      />
      <DataModelFieldSection
        model={model}
        kind="fields"
        result={fieldsResult}
        archived={fieldsArchived}
        onArchivedChange={setFieldsArchived}
        onCreate={() => setEditor({})}
        {...sectionActions}
      />
      {!fieldsArchived && model.source === 'CUSTOM' && (
        <Collapsible className="border-t pt-4">
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 font-normal text-muted-foreground"
            >
              <IconCode />
              GraphQL API
              <IconChevronRight className="size-3" />
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-3 pt-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Fields are typed selections and inputs through the existing
              /graphql endpoint.
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted/50 p-4 text-xs leading-relaxed">
              {sample}
            </pre>
          </Collapsible.Content>
        </Collapsible>
      )}
      {editor && (
        <DataModelFieldForm
          model={model}
          field={editor.field}
          initialType={editor.initialType}
          onArchive={
            editor.field
              ? () => {
                  setLifecycle(editor.field ?? null);
                  setEditor(null);
                }
              : undefined
          }
          onClose={() => setEditor(null)}
        />
      )}
      {lifecycle && (
        <DataModelFieldLifecycle
          field={lifecycle}
          onClose={() => setLifecycle(null)}
        />
      )}
      {inspecting && (
        <Sheet open onOpenChange={(open) => !open && setInspecting(null)}>
          <Sheet.View className="p-0">
            <Sheet.Header>
              <Sheet.Title>{inspecting.label}</Sheet.Title>
              <Sheet.Description className="sr-only">
                Field details
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="space-y-6 px-5 py-6">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">API name</dt>
                  <dd className="mt-1 font-mono text-xs">{inspecting.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Data type</dt>
                  <dd className="mt-1">
                    {dataModelDisplayFieldType(inspecting)}
                  </dd>
                </div>
              </dl>
              {inspecting.custom?.relation && (
                <div className="space-y-2 text-sm">
                  <p>
                    {inspecting.custom.relation.isInverse
                      ? 'This list updates when records are linked from the related object. Open that object to manage the relation.'
                      : 'This field links records to another object.'}
                  </p>
                  <Link
                    className="text-primary underline"
                    to={modelPath(inspecting.custom.relation.targetModelId)}
                  >
                    Open related object
                  </Link>
                </div>
              )}
            </Sheet.Content>
          </Sheet.View>
        </Sheet>
      )}
    </div>
  );
};

const DataModelFieldLifecycle = ({
  field,
  onClose,
}: {
  field: ModelField;
  onClose: () => void;
}) => {
  const restoring = Boolean(field.archivedAt);
  const [save, { loading, error }] = useDataModelMutation(
    restoring ? DATA_MODEL_FIELD_RESTORE : DATA_MODEL_FIELD_ARCHIVE,
    restoring ? 'Field restored' : 'Field archived',
  );
  const submit = async () => {
    try {
      const result = await save({
        variables: {
          dataModelId: field.dataModelId,
          _id: field._id,
          expectedVersion: field.version,
        },
      });
      if (result.data) onClose();
    } catch {
      /* Keep errors visible. */
    }
  };
  return (
    <AlertDialog open onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>
            {restoring ? 'Restore' : 'Archive'} {field.label}?
          </AlertDialog.Title>
          <AlertDialog.Description>
            {restoring
              ? 'Show this field again, including its saved values.'
              : 'Hide this field from records. Its saved values will be kept.'}
          </AlertDialog.Description>
        </AlertDialog.Header>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error.message}
          </p>
        )}
        <AlertDialog.Footer>
          <Button variant="outline" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={() => {
              void submit();
            }}
          >
            {loading
              ? 'Saving…'
              : restoring
              ? 'Restore field'
              : 'Archive field'}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
