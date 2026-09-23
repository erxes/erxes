import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, ScrollArea } from 'erxes-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { TeamGithubSettings } from '@/integrations/github/components/TeamGithubSettings';

export const TeamGithubPage = () => {
  const navigate = useNavigate();
  const { id: teamId } = useParams();

  if (!teamId) {
    return <div>Team not found</div>;
  }

  return (
    <PageContainer>
      <div className="flex h-16 items-center px-4">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild>
                <Button
                  variant="ghost"
                  className="font-semibold text-foreground"
                  onClick={() =>
                    navigate(`/settings/operation/team/details/${teamId}`)
                  }
                >
                  <IconArrowLeft size={16} className="stroke-foreground" />
                  Team settings
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <ScrollArea>
        <section className="mx-auto w-full max-w-2xl px-4 pb-8">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold">GitHub integration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the organization and repository used by this team.
            </p>
          </div>
          <TeamGithubSettings teamId={teamId} />
        </section>
      </ScrollArea>
    </PageContainer>
  );
};
