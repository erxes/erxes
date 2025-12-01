import React, { useState, useEffect } from 'react';
import { Button } from 'erxes-ui';
import { IconX, IconUpload } from '@tabler/icons-react';
import { ITemplate, ITemplateInput } from '../types/types';
import { useTemplateAdd, useTemplateEdit } from '../hooks/useTemplates';

interface IProps {
  template?: ITemplate;
  onClose: () => void;
  onSuccess: () => void;
}

const TemplateForm: React.FC<IProps> = ({ template, onClose, onSuccess }) => {
  const isEditMode = !!template;

  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [formData, setFormData] = useState<ITemplateInput>({
    name: '',
    content: '',
    contentType: '',
    description: '',
    pluginType: '',
    categoryIds: [],
    status: 'active',
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        content: template.content,
        contentType: template.contentType || '',
        description: template.description || '',
        pluginType: template.pluginType || '',
        categoryIds: template.categoryIds || [],
        status: template.status || 'active',
      });
    }
  }, [template]);

  const { addTemplate, loading: addLoading } = useTemplateAdd({
    onCompleted: () => {
      onSuccess();
      onClose();
    },
  });

  const { editTemplate, loading: editLoading } = useTemplateEdit({
    onCompleted: () => {
      onSuccess();
      onClose();
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    try {
      const text = await file.text();
      let templateData: ITemplateInput;

      try {
        const jsonData = JSON.parse(text);
        templateData = {
          name: jsonData.name || file.name.replace('.json', ''),
          content: jsonData.content || '',
          contentType: jsonData.contentType || '',
          description: jsonData.description || '',
          pluginType: jsonData.pluginType || '',
          categoryIds: jsonData.categoryIds || [],
          status: jsonData.status || 'active',
        };
      } catch {
        templateData = {
          name: file.name,
          content: text,
          contentType: '',
          description: `Uploaded from ${file.name}`,
          status: 'active',
        };
      }

      if (!templateData.name || !templateData.contentType) {
        alert(
          'Template must have a name and contentType. Please use a valid JSON file.',
        );
        setUploading(false);
        return;
      }

      await addTemplate({
        variables: { doc: templateData },
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload template. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Name is required');
      return;
    }

    if (isEditMode && template) {
      await editTemplate({
        variables: {
          _id: template._id,
          doc: {
            name: formData.name,
            description: formData.description,
            status: formData.status,
          },
        },
      });
    } else {
      await addTemplate({
        variables: { doc: formData },
      });
    }
  };

  const loading = addLoading || editLoading || uploading;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-sidebar sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            {isEditMode ? 'Edit Template' : 'Upload Template'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <IconX size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-sidebar">
          {isEditMode ? (
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-4 pb-3 border-b">
                  Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-medium">{template?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm">{template?.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          template?.status === 'active'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm capitalize">
                        {template?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Template description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors bg-card">
                <IconUpload
                  size={48}
                  className="mx-auto text-muted-foreground mb-4"
                />
                <h3 className="text-lg font-medium mb-2">
                  Upload Template File
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a JSON file containing template data
                </p>

                <label className="inline-block">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <IconUpload size={16} />
                    {loading ? 'Uploading...' : 'Choose File'}
                  </span>
                </label>

                {fileName && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Selected: <span className="font-medium">{fileName}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 bg-muted/50 rounded-lg p-4 border">
                <h4 className="text-sm font-medium mb-2">
                  JSON Format should be like this:
                </h4>
                <pre className="text-xs text-muted-foreground overflow-x-auto bg-background p-3 rounded border">
                  {`{
  "name": "Template Name",
  "contentType": "type",
  "content": "Template content",
  "description": "Description",
  "pluginType": "plugin",
  "categoryIds": [],
  "status": "active"
 }`}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-sidebar sticky bottom-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {isEditMode && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;
