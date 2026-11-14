import {
  type AssistantAppearance,
  AssistantAvatarBody,
  AssistantAvatarColor,
  AssistantAvatarExpression,
} from '@erxes/core-contract';
import { IconMoodSmile } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea, ToggleGroup, useToast } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { IconTip } from '~/components/IconTip';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { AssistantAvatar, appearanceQuery } from '~/modules/assistant/AssistantAvatar';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';

interface Choice {
  id: string;
  label: string;
  look: AssistantAppearance;
}

const Picker = ({
  title,
  value,
  choices,
  onPick,
}: {
  title: string;
  value: string;
  choices: Choice[];
  onPick: (next: AssistantAppearance) => void;
}) => {
  const heading = useId();

  return (
    <section className="flex flex-col gap-2">
      <h2 id={heading} className="text-sm font-medium">
        {title}
      </h2>
      <ToggleGroup
        aria-labelledby={heading}
        className="flex-wrap justify-start"
        value={[value]}
        onValueChange={([next]) => {
          const picked = choices.find((choice) => choice.id === next);

          if (picked) onPick(picked.look);
        }}
      >
        {choices.map((choice) => (
          <IconTip key={choice.id} label={choice.label}>
            <ToggleGroup.Item value={choice.id} aria-label={choice.label} className="size-12">
              <span className="flex">
                <AssistantAvatar size={40} animated={false} appearance={choice.look} />
              </span>
            </ToggleGroup.Item>
          </IconTip>
        ))}
      </ToggleGroup>
    </section>
  );
};

const usePickers = (appearance: AssistantAppearance) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'appearance' });

  return [
    {
      title: t('body', 'Shape'),
      value: appearance.body,
      choices: AssistantAvatarBody.options.map((id) => ({
        id,
        label: t(`bodies.${id}`),
        look: { ...appearance, body: id },
      })),
    },
    {
      title: t('color', 'Colour'),
      value: appearance.color,
      choices: AssistantAvatarColor.options.map((id) => ({
        id,
        label: t(`colors.${id}`),
        look: { ...appearance, color: id },
      })),
    },
    {
      title: t('expression', 'Resting expression'),
      value: appearance.expression,
      choices: AssistantAvatarExpression.options.map((id) => ({
        id,
        label: t(`expressions.${id}`),
        look: { ...appearance, expression: id },
      })),
    },
  ];
};

const AppearanceEditor = ({ saved }: { saved: AssistantAppearance }) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'appearance' });
  const { toast } = useToast();
  const client = useQueryClient();

  const update = useMutation(
    orpc.assistant.updateAppearance.mutationOptions({
      onSuccess: (next) => client.setQueryData(appearanceQuery().queryKey, next),
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  const appearance = update.isPending && update.variables ? update.variables : saved;
  const pickers = usePickers(appearance);

  return (
    <>
      <figure className="flex flex-col items-center gap-3 rounded-lg border py-8">
        <AssistantAvatar
          size={128}
          appearance={appearance}
          follow
          label={t('preview', 'Preview')}
        />
        <figcaption className="text-sm text-muted-foreground">{t('preview', 'Preview')}</figcaption>
      </figure>
      {pickers.map((picker) => (
        <Picker key={picker.title} {...picker} onPick={(next) => update.mutate(next)} />
      ))}
    </>
  );
};

export const AssistantAppearancePage = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'appearance' });
  const canChat = useCan()('assistant.chat');
  const appearance = useQuery({ ...appearanceQuery(), enabled: canChat });

  if (!canChat) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Assistant appearance'),
                to: paths.settings.assistantAppearance,
                icon: IconMoodSmile,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'How the assistant looks to you, on every device. Other members choose their own.',
            )}
          </p>
          <QueryState query={appearance}>
            {(saved) => <AppearanceEditor saved={saved} />}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
