import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconFileText,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Card,
  Dialog,
  Label,
  Input,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  useContractTemplates,
  useCreateContractTemplate,
  useDeleteContractTemplate,
} from '~/modules/insurance/hooks';
import { useMutation, gql } from '@apollo/client';

const MIGRATE_TEMPLATE_COLLECTION = gql`
  mutation MigrateTemplateCollection {
    _migrateTemplateCollection
  }
`;

export default function ContractTemplatesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const { contractTemplates, loading } = useContractTemplates();
  const { createContractTemplate } = useCreateContractTemplate();
  const { deleteContractTemplate } = useDeleteContractTemplate();
  const [migrateMutation] = useMutation(MIGRATE_TEMPLATE_COLLECTION);

  const handleMigrate = async () => {
    try {
      await migrateMutation();
      alert('Index deleted! You can now create templates.');
    } catch (error) {
      console.error('Migration error:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await createContractTemplate({
        variables: {
          name: templateName,
          description: templateDescription,
        },
      });
      setIsDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this template?')) {
      try {
        await deleteContractTemplate({ variables: { id } });
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/insurance/products">Insurance</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Contract Templates</Breadcrumb.Item>
        </Breadcrumb>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Contract Templates</h1>
              <p className="text-muted-foreground">
                Manage contract PDF templates
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleMigrate}>
                🔧 Fix Index
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <IconPlus size={20} className="mr-2" />
                New Template
              </Button>
            </div>
          </div>

          <Separator />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : contractTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates yet. Click "New Template" to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {contractTemplates.map((template) => (
                <Card key={template.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <IconFileText className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created:{' '}
                          {new Date(template.createdAt).toLocaleDateString(
                            'mn-MN',
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/insurance/contract-templates/${template.id}/preview`}
                      >
                        <Button variant="outline" size="sm">
                          <IconEye size={16} className="mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link
                        to={`/insurance/contract-templates/${template.id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          <IconEdit size={16} className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <IconTrash size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>New Contract Template</Dialog.Title>
          </Dialog.Header>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e: any) => setTemplateName(e.target.value)}
                placeholder="Example: Car Insurance Contract"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={templateDescription}
                onChange={(e: any) => setTemplateDescription(e.target.value)}
                placeholder="Brief description about this template"
              />
            </div>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!templateName}
            >
              Create
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
