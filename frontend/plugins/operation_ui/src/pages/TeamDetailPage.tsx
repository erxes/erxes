import { Breadcrumb } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';

import { TeamDetails } from '@/team/components/team-details/TeamDetails';
import { useNavigate } from 'react-router-dom';
import { Button } from 'erxes-ui';

export const TeamDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="px-4 h-16 flex items-center">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="text-foreground font-semibold"
                  onClick={() => navigate('/settings/operation/team')}
                >
                  <IconArrowLeft size={16} className="stroke-foreground" />
                  Teams
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <section className="mx-auto max-w-2xl w-full relative">
        <div className="flex items-center">
          <TeamDetails />
        </div>
      </section>
    </div>
  );
};
