import { IconCopy } from '@tabler/icons-react';
import { CopyText, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CopyTextAction = ({
  text,
  inline,
}: {
  text: string;
  inline: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  if (inline) {
    return (
      <CopyText
        value={text}
        className="size-8 justify-center rounded-md text-muted-foreground hover:bg-muted [&>span]:gap-0 [&>span]:text-[0px]"
      >
        <IconCopy className="size-4" />
        <span className="sr-only">{t('copy-text')}</span>
      </CopyText>
    );
  }
  return (
    <DropdownMenu.Item asChild className="rounded-lg">
      <CopyText value={text} className="w-full">
        <IconCopy className="size-4" />
        {t('copy-text')}
      </CopyText>
    </DropdownMenu.Item>
  );
};
