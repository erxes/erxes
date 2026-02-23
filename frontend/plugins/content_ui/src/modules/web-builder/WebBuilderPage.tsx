import { useQuery } from '@apollo/client';
import { Button, Spinner, ToggleGroup } from 'erxes-ui';
import {
  IconArrowUpRight,
  IconCalendar,
  IconEdit,
  IconLayoutGrid,
  IconList,
  IconWorldPlus,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsLayout } from '../cms/components/shared/CmsLayout';
import { EmptyState } from '../cms/components/shared/EmptyState';
import { CLIENT_PORTAL_GET_CONFIGS } from '../cms/graphql/queries';

const getThumbnailGradient = (index: number) => {
  const gradients = [
    'bg-gradient-to-br from-orange-200 to-orange-300',
    'bg-gradient-to-br from-red-200 to-red-300',
    'bg-gradient-to-br from-blue-200 to-blue-300',
    'bg-gradient-to-br from-green-200 to-green-300',
    'bg-gradient-to-br from-yellow-200 to-yellow-300',
    'bg-gradient-to-br from-purple-200 to-purple-300',
    'bg-gradient-to-br from-pink-200 to-pink-300',
    'bg-gradient-to-br from-indigo-200 to-indigo-300',
    'bg-gradient-to-br from-teal-200 to-teal-300',
  ];
  return gradients[index % gradients.length];
};

interface Project {
  _id: string;
  name: string;
  description?: string;
  domain?: string;
  createdAt: string;
  url?: string;
}

export function WebBuilderPage() {
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('thumbnail');
  const { data, loading } = useQuery(CLIENT_PORTAL_GET_CONFIGS);
  const projects: Project[] = data?.clientPortalGetConfigs || [];

  const breadcrumbItems = [
    {
      label: 'Web Builder',
      href: '/content/web-builder',
      icon: <IconWorldPlus />,
    },
  ];

  const headerActions = (
    <Button
      onClick={() =>
        window.open(
          projects[0]?.url || '#',
          '_blank',
          'noopener,noreferrer',
        )
      }
      variant="outline"
    >
      <IconWorldPlus className="mr-2 h-4 w-4" />
      Open Builder
    </Button>
  );

  return (
    <CmsLayout
      showSidebar={false}
      breadcrumbItems={breadcrumbItems}
      headerActions={headerActions}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Found {projects.length} results
            </div>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as 'list' | 'thumbnail')
              }
            >
              <ToggleGroup.Item value="list" aria-label="List view">
                <IconList className="h-4 w-4" />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="thumbnail" aria-label="Thumbnail view">
                <IconLayoutGrid className="h-4 w-4" />
              </ToggleGroup.Item>
            </ToggleGroup>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <EmptyState
                icon={IconWorldPlus}
                title="No projects yet"
                description="Get started by creating your first web builder project."
              />
            </div>
          ) : viewMode === 'thumbnail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className="bg-white h-full rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className={`aspect-video ${getThumbnailGradient(index)} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <IconWorldPlus className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {project.domain && (
                      <div className="absolute bottom-2 right-2">
                        <div className="px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700">
                          {project.domain}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {project.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <IconCalendar className="w-3 h-3" />
                        <span>
                          {new Date(project.createdAt).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.url && (
                          <a
                            href={`${project.url}/dashboard/projects/${project._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                          >
                            <IconEdit className="w-3 h-3" />
                            <span>Edit</span>
                          </a>
                        )}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                          >
                            <IconArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 ${getThumbnailGradient(index)} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <IconWorldPlus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {project.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="w-3 h-3" />
                          <span>
                            {new Date(project.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        {project.domain && (
                          <span className="font-medium">{project.domain}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.url && (
                        <a
                          href={`${project.url}/dashboard/projects/${project._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        >
                          <IconEdit className="w-3 h-3" />
                          <span>Edit</span>
                        </a>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        >
                          <IconArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </CmsLayout>
  );
}
