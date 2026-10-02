import { Tabs } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { EarnTableEditor } from './earn-table/EarnTableEditor';
import { SpendRulesEditor } from './SpendRulesEditor';

export const ScoreCampaignActionTabs = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <Tabs defaultValue="add" className="w-full">
      <Tabs.List>
        <Tabs.Trigger value="add">{t('add')}</Tabs.Trigger>
        <Tabs.Trigger value="subtract">{t('subtract')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="add" className="pt-4">
        <EarnTableEditor form={form} />
      </Tabs.Content>
      <Tabs.Content value="subtract" className="pt-4">
        <SpendRulesEditor form={form} />
      </Tabs.Content>
    </Tabs>
  );
};
