import { TeamDetails } from '@/team/components/team-details/TeamDetails';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, ScrollArea } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const TeamDetailPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
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
      <ScrollArea>
        <section className="mx-auto max-w-2xl w-full relative">
          <div className="flex items-center h-auto mb-5">
            <TeamDetails />
          </div>
        </section>
      </ScrollArea>
    </PageContainer>
  );
};
