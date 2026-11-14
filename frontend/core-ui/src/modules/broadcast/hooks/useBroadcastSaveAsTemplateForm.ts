import { useBroadcastSaveAsTemplate } from '@/broadcast/hooks/useBroadcastSaveAsTemplate';
import { ChangeEvent, useCallback, useState } from 'react';

/** Naming the campaign's content and saving it as a template. */
export const useBroadcastSaveAsTemplateForm = () => {
  const { save, loading } = useBroadcastSaveAsTemplate();
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const onNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );

  const handleSave = useCallback(async () => {
    if (await save(name)) {
      setName('');
      setOpen(false);
    }
  }, [save, name]);

  return {
    open,
    setOpen,
    name,
    onNameChange,
    saveDisabled: !name || loading,
    saveLabelKey: loading ? 'saveAsTemplateSaving' : 'saveAsTemplateAction',
    handleSave,
  };
};
