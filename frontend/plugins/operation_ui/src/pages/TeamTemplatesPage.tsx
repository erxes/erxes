import { TemplateList } from '@/template/components/TemplateList';
import { PageContainer, Breadcrumb, Button } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';

export const TeamTemplatesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <PageContainer>
      <div className="h-full w-full bg-background overflow-auto">
        <div className="px-4 h-16 flex items-center">
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link asChild className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="text-foreground font-semibold"
                    onClick={() =>
                      navigate(`/settings/operation/team/details/${id}`)
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
        <TemplateList />
      </div>
    </PageContainer>
  );
};
