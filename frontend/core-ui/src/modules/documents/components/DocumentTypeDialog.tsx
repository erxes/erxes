import { useTranslation } from 'react-i18next';
import { Button, Dialog, Label, Select, Spinner } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useDocumentsTypes } from '../hooks/useDocumentsTypes';

type DocumentTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (contentType: string) => void | Promise<void>;
  initialContentType?: string;
  duplicate?: boolean;
  loading?: boolean;
};

export const DocumentTypeDialog = ({
  open,
  onOpenChange,
  onSelect,
  initialContentType,
  duplicate = false,
  loading = false,
}: DocumentTypeDialogProps) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const {
    documentsTypes,
    error,
    loading: typesLoading,
    refetch,
  } = useDocumentsTypes();
  const [selectedType, setSelectedType] = useState(initialContentType || '');
  const validType = documentsTypes.some(
    (type) => type.contentType === selectedType,
  );

  let typeContent: ReactNode;
  if (typesLoading) typeContent = <Spinner />;
  else if (error)
    typeContent = (
      <div className="space-y-2">
        <p className="text-sm text-destructive">{t('types-load-error')}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void refetch().catch(() => undefined);
          }}
        >
          {t('try-again')}
        </Button>
      </div>
    );
  else if (documentsTypes.length === 0)
    typeContent = (
      <p className="text-sm text-muted-foreground">
        {t('no-types')}
      </p>
    );
  else
    typeContent = (
      <div className="grid gap-2">
        <Label htmlFor="document-type">{t('document-type')}</Label>
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
          disabled={loading}
        >
          <Select.Trigger id="document-type">
            <Select.Value placeholder={t('select-type')} />
          </Select.Trigger>
          <Select.Content>
            {documentsTypes.map((type) => (
              <Select.Item key={type.contentType} value={type.contentType}>
                {type.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    );
  let actionLabel = duplicate ? t('duplicate') : t('create-document');
  if (loading) actionLabel = t('duplicating');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <Dialog.Header>
          <Dialog.Title>
            {duplicate ? t('duplicate-document') : t('add-document')}
          </Dialog.Title>
          <Dialog.Description>
            {t('type-description')}
            {duplicate &&
              selectedType &&
              selectedType !== initialContentType &&
              ` ${t('change-type-description')}`}
          </Dialog.Description>
        </Dialog.Header>
        {typeContent}
        <Dialog.Footer>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!validType || loading || typesLoading || !!error}
            onClick={() => {
              void onSelect(selectedType);
            }}
          >
            {actionLabel}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
