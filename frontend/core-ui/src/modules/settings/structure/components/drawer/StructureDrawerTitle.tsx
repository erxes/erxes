import { Input } from 'erxes-ui';
import { KeyboardEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureEntitySave } from '../../hooks/useStructureEntitySave';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { IStructureEntityDetail } from '../../types/structureEntity';

export const StructureDrawerTitle = ({
  entity,
  editable,
}: {
  entity: Pick<IStructureEntityDetail, '_id' | 'title'>;
  editable: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { save } = useStructureEntitySave();
  const { failure } = useStructureFeedback();
  const [value, setValue] = useState(entity.title);

  useEffect(() => setValue(entity.title), [entity.title]);

  if (!editable) {
    return (
      <h2 className="min-w-0 flex-1 truncate px-1.5 text-lg font-semibold">
        {entity.title}
      </h2>
    );
  }

  const commit = async () => {
    const title = value.trim();

    if (title === entity.title) {
      setValue(entity.title);
      return;
    }

    if (!title) {
      setValue(entity.title);
      failure(new Error(t('title-required')));
      return;
    }

    const saved = await save(
      { _id: entity._id, title },
      t('node-renamed', { title }),
    );

    if (!saved) {
      setValue(entity.title);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }

    if (event.key === 'Escape' && value !== entity.title) {
      event.preventDefault();
      setValue(entity.title);
    }
  };

  return (
    <Input
      value={value}
      aria-label={t('title')}
      className="h-9 min-w-0 flex-1 bg-transparent px-1.5 text-lg font-semibold shadow-none hover:bg-accent focus-visible:bg-background"
      onChange={(event) => setValue(event.currentTarget.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
};
