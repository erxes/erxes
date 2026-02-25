import { PageContainer, Button, Breadcrumb } from 'erxes-ui';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TemplateForm } from '@/template/components/TemplateForm';
import { useQuery } from '@apollo/client';
import { templateDetailQuery } from '@/template/graphql/queries';
import { IconArrowLeft } from '@tabler/icons-react';

export const TemplateFormPage = () => {
  const { id: teamId, templateId } = useParams<{
    id: string;
    templateId?: string;
  }>();
  const navigate = useNavigate();

  const { data, loading } = useQuery(templateDetailQuery, {
    variables: { _id: templateId },
    skip: !templateId,
  });

  const template = data?.operationTemplateDetail;

  if (loading) return null;

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
                    asChild
                  >
                    <Link to={`/settings/operation/team/templates/${teamId}`}>
                      <IconArrowLeft
                        size={16}
                        className="stroke-foreground mr-2"
                      />
                      Template List
                    </Link>
                  </Button>
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </div>
        <div className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-4xl mx-auto border rounded-lg bg-card text-card-foreground shadow-sm">
            <TemplateForm
              teamId={teamId}
              template={template}
              onCancel={() => navigate(-1)}
              afterSave={() =>
                navigate(`/settings/operation/team/templates/${teamId}`)
              }
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
