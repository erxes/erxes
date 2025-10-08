import { Members } from '@/channels/components/members/Members';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const ChannelMembersPage = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen">
      <div className="px-4 h-16 flex items-center">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="text-foreground font-semibold"
                  onClick={() => navigate(-1)}
                >
                  <IconArrowLeft size={16} className="stroke-foreground" />
                  Channel Settings
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <Members />
    </div>
  );
};
