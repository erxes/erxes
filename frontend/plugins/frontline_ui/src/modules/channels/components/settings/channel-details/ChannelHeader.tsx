import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ChannelHeader = () => {
  const { t } = useTranslation('frontline');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  return (
    <div className="px-4 h-16 flex items-center">
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild className="flex items-center gap-1">
              <Button
                variant="ghost"
                className="text-foreground font-semibold"
                onClick={() => navigate(`/settings/frontline/channels/${id}`)}
              >
                <IconArrowLeft size={16} className="stroke-foreground" />
                {t('channel-settings')}
              </Button>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </div>
  );
};
