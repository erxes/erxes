import { IconBolt, IconChevronRight, IconStairs } from '@tabler/icons-react';
import { Badge, Button, Form, Label, Skeleton } from 'erxes-ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { useCampaignAutomationSeeds } from '../hooks/useCampaignAutomationSeeds';
import {
  TCampaignAutomation,
  useScoreCampaignAutomations,
} from '../hooks/useScoreCampaignAutomations';

const AutomationList = ({
  title,
  empty,
  loading,
  automations,
  editPath,
  create,
}: {
  title: string;
  empty: string;
  loading: boolean;
  automations: TCampaignAutomation[];
  editPath: (automationId: string) => string;
  create: { label: string; icon: typeof IconBolt; onClick: () => void };
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <Label>{title}</Label>
      {!loading && automations.length > 0 && (
        <Badge variant="secondary">{automations.length}</Badge>
      )}
    </div>
    {loading && <Skeleton className="h-8 w-full" />}
    {!loading && !automations.length && (
      <p className="text-sm text-muted-foreground">{empty}</p>
    )}
    {automations.map(({ _id, name, status, tiers }) => (
      <Link
        key={_id}
        to={editPath(_id)}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
      >
        <IconBolt className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{name}</span>
        {tiers && (
          <span className="truncate text-xs text-muted-foreground">
            {tiers.join(' · ')}
          </span>
        )}
        <Badge variant={status === 'active' ? 'success' : 'secondary'}>
          {status || 'draft'}
        </Badge>
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    ))}
    <Button
      type="button"
      variant="secondary"
      className="self-start"
      onClick={create.onClick}
    >
      <create.icon />
      {create.label}
    </Button>
  </div>
);

/** What gives these points and sets the tiers; each is started from the rule it serves. */
export const ScoreCampaignAutomations = ({
  form,
  campaignId,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  campaignId: string;
}) => {
  const { t } = useTranslation('loyalty');
  const accountTypeId = useWatch({
    control: form.control,
    name: 'accountTypeId',
  });
  const {
    loading,
    pointAutomations,
    tierAutomations,
    hasTiers,
    accountTypeName,
  } = useScoreCampaignAutomations({ campaignId, accountTypeId });
  const { createPointAutomation, createTierAutomation, editPath } =
    useCampaignAutomationSeeds(form);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold">
          {t('score-campaign-delivery-title')}
        </h3>
        <Form.Description>{t('score-campaign-delivery-hint')}</Form.Description>
      </div>
      <AutomationList
        title={t('score-campaign-point-automations')}
        empty={t('score-campaign-point-automations-empty')}
        loading={loading}
        automations={pointAutomations}
        editPath={editPath}
        create={{
          label: t('score-campaign-point-automation-create'),
          icon: IconBolt,
          onClick: () => createPointAutomation(),
        }}
      />
      {hasTiers && (
        <AutomationList
          title={t('score-campaign-tier-automations', {
            name: accountTypeName,
          })}
          empty={t('score-campaign-tier-automations-empty')}
          loading={loading}
          automations={tierAutomations}
          editPath={editPath}
          create={{
            label: t('score-campaign-tier-automation-create'),
            icon: IconStairs,
            onClick: createTierAutomation,
          }}
        />
      )}
    </div>
  );
};
