import { ComposerWindow } from '@/integrations/mail/composer/components/DirectMailComposerWindow';
import { DirectMailComposerContext } from '@/integrations/mail/composer/contexts/DirectMailComposerContext';
import { useDirectMailComposer } from '@/integrations/mail/composer/hooks/useDirectMailComposer';

export const DirectMailComposerContent = () => {
  const composer = useDirectMailComposer();
  if (!composer.target || !composer.canComposeEmail) return null;
  return (
    <DirectMailComposerContext.Provider value={composer}>
      <ComposerWindow />
    </DirectMailComposerContext.Provider>
  );
};
