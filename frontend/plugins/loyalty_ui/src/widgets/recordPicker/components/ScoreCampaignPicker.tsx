import { IconPencil, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IRecordPickerWidgetProps } from 'ui-modules';
import { SelectScoreCampaign } from '~/modules/loyalties/scores/components/selects/SelectScoreCampaign';
import { LoyaltyScoreCreateSheet } from '~/modules/loyalties/settings/score/components/LoyaltyScoreCreateSheet';
import { LoyaltyScoreEditSheet } from '~/modules/loyalties/settings/score/score-detail/components/LoyaltyScoreEditSheet';
import { useScoreCampaignPicker } from '../hooks/useScoreCampaignPicker';

export const ScoreCampaignPicker = ({
  value,
  onValueChange,
  placeholder,
}: IRecordPickerWidgetProps) => {
  const { t } = useTranslation('loyalty');
  const { creating, setCreating, editing, startEdit, created } =
    useScoreCampaignPicker(value, onValueChange);

  return (
    <div className="flex items-center gap-1">
      <SelectScoreCampaign
        value={value || ''}
        onValueChange={onValueChange}
        placeholder={placeholder}
        className="min-w-0 flex-1"
        status="active"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!value}
        onClick={startEdit}
        aria-label={t('edit')}
      >
        <IconPencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setCreating(true)}
        aria-label={t('loyalty-new-campaign')}
      >
        <IconPlus />
      </Button>
      <LoyaltyScoreCreateSheet
        open={creating}
        onOpenChange={setCreating}
        onCreated={created}
      />
      {editing && <LoyaltyScoreEditSheet />}
    </div>
  );
};
