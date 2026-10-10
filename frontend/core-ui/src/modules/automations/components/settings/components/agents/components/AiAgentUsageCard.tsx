import { IconExternalLink } from '@tabler/icons-react';
import { Badge, Button, Card } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type TAiAgentUsage = {
  total: number;
  active: number;
  automations: Array<{ _id: string; name: string; status: string }>;
};

/**
 * Deleting an agent an automation still points at breaks it only at run time,
 * so the dependents are named here rather than discovered later.
 */
export const AiAgentUsageCard = ({ usage }: { usage?: TAiAgentUsage }) => {
  const { t } = useTranslation('automations');
  const navigate = useNavigate();
  const automations = usage?.automations || [];

  return (
    <Card className="p-4">
      <div className="space-y-1">
        <div className="text-sm font-medium">
          {t('settings-agents-used-by')}
        </div>
        <p className="text-xs text-muted-foreground">
          {automations.length
            ? t('settings-agents-used-by-description')
            : t('settings-agents-unused-description')}
        </p>
      </div>

      {!!automations.length && (
        <div className="mt-3 grid gap-1">
          {automations.map(({ _id, name, status }) => (
            <Button
              key={_id}
              variant="ghost"
              className="h-8 w-full justify-start gap-2 px-2"
              onClick={() => navigate(`/automations/edit/${_id}`)}
            >
              <IconExternalLink className="size-3.5 shrink-0" />
              <span className="min-w-0 truncate">
                {name || t('sidebar-untitled')}
              </span>
              <Badge variant="secondary" className="ml-auto shrink-0">
                {status}
              </Badge>
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
};
