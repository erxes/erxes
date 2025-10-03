import { Breadcrumb, Button } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';

import { useNavigate } from 'react-router-dom';
import { Statuses } from '@/team/components/status/Statuses';

export const TeamStatusPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-auto">
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
                  Team settings
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <section className="mx-auto max-w-2xl">
        <div className="flex items-center">
          <Statuses />
        </div>
      </section>
    </div>
  );
};
