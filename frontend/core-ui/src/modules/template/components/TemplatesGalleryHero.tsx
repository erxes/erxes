import { AiAgentBot } from '@/automations/components/settings/components/agents/components/bot/AiAgentBot';
import { useTemplatesGalleryHero } from '@/template/hooks/useTemplatesGalleryHero';
import { IconSearch, IconX } from '@tabler/icons-react';
import { cn, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TemplatesGalleryHero = () => {
  const { t } = useTranslation('templates');
  const { input, setInput, clearInput, subtitle, botPose, apps, toggleApp } =
    useTemplatesGalleryHero();

  return (
    <section className="relative mx-5 mt-4 overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 px-6 py-7">
      {/* Soft bubbles behind the bot and the corner, for a little warmth */}
      <span className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-primary/10" />
      <span className="pointer-events-none absolute -bottom-16 -left-10 size-36 rounded-full bg-primary/10" />
      <span className="pointer-events-none absolute bottom-6 right-56 size-3 rounded-full bg-primary/20" />
      <span className="pointer-events-none absolute left-1/3 top-5 size-2 rounded-full bg-primary/25" />

      <div className="relative flex items-center gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              {t('hero-title')}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="relative max-w-lg">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('hero-search-placeholder')}
              className="h-10 rounded-full bg-background pl-10 pr-9 shadow-xs"
            />
            {input && (
              <button
                type="button"
                onClick={clearInput}
                aria-label={t('hero-search-clear')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <IconX className="size-4" />
              </button>
            )}
          </div>

          {apps.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {apps.map(({ name, label, icon: Icon, isActive }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleApp(name)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary/20 bg-background text-foreground hover:border-primary/40',
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <AiAgentBot pose={botPose} className="hidden size-36 sm:block" />
      </div>
    </section>
  );
};
