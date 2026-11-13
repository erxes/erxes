import { IconCopy, IconEye, IconEyeOff } from '@tabler/icons-react';
import { Button, cn, Input, toast } from 'erxes-ui';
import { ComponentPropsWithoutRef, forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SecretInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, 'type'>;

export const SecretInput = forwardRef<HTMLInputElement, SecretInputProps>(
  ({ className, value, ...props }, ref) => {
    const { t } = useTranslation('frontline', {
      keyPrefix: 'modules.integrations',
    });
    const [isVisible, setIsVisible] = useState(false);
    const secret = typeof value === 'string' ? value : '';

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(secret);
        toast({ title: t('secret-copied-to-clipboard'), variant: 'success' });
      } catch {
        toast({ title: t('failed-to-copy-secret'), variant: 'destructive' });
      }
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          value={secret}
          type={isVisible ? 'text' : 'password'}
          autoComplete="off"
          className={cn('pr-16 font-mono', className)}
        />
        <div className="absolute inset-y-0 right-1 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-sm p-0 text-accent-foreground/60 hover:text-foreground"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? t('hide-secret') : t('show-secret')}
            aria-pressed={isVisible}
          >
            {isVisible ? <IconEyeOff size={15} /> : <IconEye size={15} />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-sm p-0 text-accent-foreground/60 hover:text-foreground"
            onClick={handleCopy}
            disabled={!secret}
            aria-label={t('copy-secret')}
          >
            <IconCopy size={15} />
          </Button>
        </div>
      </div>
    );
  },
);

SecretInput.displayName = 'SecretInput';
