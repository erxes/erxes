import type { ProductCategory } from '@erxes/core-contract';
import { Button, Dialog, Input, Label, Spinner, useToast } from 'erxes-ui';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isApiError, messageOf } from '~/lib/api';
import { CategoryPicker } from '../categories/CategoryPicker';
import { categoryWithDescendants } from '../categories/categoryTree';
import { useCategoryMutations, useProductCategories } from '../categories/useProductCategories';

/** What the dialog does: add one (under `parentId`), or rename and move `category`. */
export type CategoryDialogTarget =
  | { mode: 'add'; parentId: string | null }
  | { mode: 'edit'; category: ProductCategory };

/** Adds or changes a category; a taken name or a bad parent shows under its field. */
const useCategorySave = (editing: ProductCategory | null, onDone: () => void) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { create, update } = useCategoryMutations();
  const [errors, setErrors] = useState<{ name?: string; parent?: string }>({});

  const onError = (error: Error) => {
    if (isApiError(error, 'CATEGORY_EXISTS')) {
      setErrors({
        name: t('errors.category-exists', 'A category with this name is already there.'),
      });
    } else if (isApiError(error, 'INVALID_CATEGORY')) {
      setErrors({
        parent: t(
          'errors.invalid-parent',
          'Pick another parent: this one is gone or under this category.',
        ),
      });
    } else {
      toast({
        variant: 'destructive',
        title: t('category.save-failed', 'Could not save the category'),
        description: messageOf(error),
      });
    }
  };

  const save = (name: string, parentId: string | null) => {
    if (!name) {
      setErrors({ name: t('form.name-required', 'Enter a name') });

      return;
    }

    setErrors({});

    if (editing) {
      update.mutate({ id: editing.id, name, parentId }, { onSuccess: onDone, onError });
    } else {
      create.mutate({ name, parentId }, { onSuccess: onDone, onError });
    }
  };

  return { save, errors, saving: create.isPending || update.isPending };
};

const CategoryForm = ({ target, onDone }: { target: CategoryDialogTarget; onDone: () => void }) => {
  const { t } = useTranslation('product');
  const id = useId();
  const { categories } = useProductCategories();
  const editing = target.mode === 'edit' ? target.category : null;
  const [name, setName] = useState(editing?.name ?? '');

  const [parentId, setParentId] = useState(
    target.mode === 'edit' ? target.category.parentId : target.parentId,
  );

  const { save, errors, saving } = useCategorySave(editing, onDone);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save(name.trim(), parentId);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('fields.name', 'Name')}</Label>
        <Input
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-parent`}>{t('category.parent', 'Under')}</Label>
        <CategoryPicker
          id={`${id}-parent`}
          value={parentId}
          onChange={setParentId}
          noneLabel={t('category.top-level', 'Top level')}
          exclude={editing ? categoryWithDescendants(categories, editing.id) : undefined}
        />
        {errors.parent && <p className="text-sm text-destructive">{errors.parent}</p>}
      </div>
      <Dialog.Footer>
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          {t('actions.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Spinner size="sm" />}
          {editing ? t('actions.save', 'Save') : t('category.add', 'Add category')}
        </Button>
      </Dialog.Footer>
    </form>
  );
};

/** Adds a category, or renames and moves one. */
export const CategoryDialog = ({
  target,
  onClose,
}: {
  target: CategoryDialogTarget | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation('product');

  const title =
    target?.mode === 'edit'
      ? t('category.edit', 'Rename or move category')
      : t('category.add', 'Add category');

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={title}
          description={t(
            'category.dialog-description',
            'Categories group products and can sit under one another.',
          )}
        />
        {target && <CategoryForm target={target} onDone={onClose} />}
      </Dialog.Content>
    </Dialog>
  );
};
