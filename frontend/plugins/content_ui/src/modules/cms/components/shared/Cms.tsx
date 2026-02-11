import { Button, ToggleGroup } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { Spinner } from 'erxes-ui';
import {
  IconLayoutGrid,
  IconList,
  IconCalendar,
  IconEdit,
  IconArrowUpRight,
  IconFileText,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { WebsiteDrawer } from '../websites/WebsiteDrawer';
import { CmsLayout } from './CmsLayout';
import { EmptyState } from './EmptyState';
import { CONTENT_CMS_LIST } from '../../graphql/queries';

const getThumbnailGradient = (color: string) => {
  const gradients = {
    orange: 'bg-gradient-to-br from-orange-200 to-orange-300',
    red: 'bg-gradient-to-br from-red-200 to-red-300',
    blue: 'bg-gradient-to-br from-blue-200 to-blue-300',
    green: 'bg-gradient-to-br from-green-200 to-green-300',
    yellow: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
    purple: 'bg-gradient-to-br from-purple-200 to-purple-300',
    pink: 'bg-gradient-to-br from-pink-200 to-pink-300',
    indigo: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
    teal: 'bg-gradient-to-br from-teal-200 to-teal-300',
  };
  return gradients[color as keyof typeof gradients] || gradients.orange;
};

interface Website {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  domain?: string;
  url?: string;
}

export function Cms() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('thumbnail');
  const [isWebsiteDrawerOpen, setIsWebsiteDrawerOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<any>(null);
  const { data, loading, error, refetch } = useQuery(CONTENT_CMS_LIST);
  const cmsList = data?.contentCMSList || [];
  const displayWebsites: Website[] = cmsList;

  const handleWebsiteCreatedOrUpdated = () => {
    refetch();
    setIsWebsiteDrawerOpen(false);
    setEditingWebsite(null);
  };

  const handleCloseWebsiteDrawer = () => {
    setIsWebsiteDrawerOpen(false);
    setEditingWebsite(null);
  };

  const handleEditWebsite = (website: any) => {
    setEditingWebsite(website);
    setIsWebsiteDrawerOpen(true);
  };

  const handleWebsiteClick = (website: any) => {
    navigate(`/content/cms/${website.clientPortalId}/posts`);
  };

  const breadcrumbItems = [
    {
      label: 'CMS',
      href: '/content/cms',
      icon: <IconFileText />,
    },
  ];

  const headerActions = (
    <>
      <Button onClick={() => setIsWebsiteDrawerOpen(true)}>
        <IconPlus className="mr-2 h-4 w-4" />
        Add CMS
      </Button>
    </>
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
              Found {cmsList.length} results
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

          {cmsList.length === 0 ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <EmptyState
                icon={IconFileText}
                title="No CMS yet"
                description="Get started by creating your first website."
                actionLabel="Add CMS"
                onAction={() => setIsWebsiteDrawerOpen(true)}
              />
            </div>
          ) : viewMode === 'thumbnail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {displayWebsites.map((website, index) => (
                <div
                  key={website._id}
                  className="bg-white h-full rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleWebsiteClick(website)}
                >
                  <div
                    className={`aspect-video ${getThumbnailGradient(
                      [
                        'orange',
                        'red',
                        'blue',
                        'green',
                        'yellow',
                        'purple',
                        'pink',
                        'indigo',
                        'teal',
                      ][index % 9],
                    )} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                    </div>

                    {website.domain && (
                      <div className="absolute bottom-2 right-2">
                        <div className="px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700">
                          {website.domain}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {website.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {website.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <IconCalendar className="w-3 h-3" />
                        <span>
                          Created on:{' '}
                          {new Date(website.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWebsite(website);
                          }}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        >
                          <IconEdit className="w-3 h-3" />
                          <span>Manage</span>
                        </button>
                        {website.url && (
                          <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
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
              {displayWebsites.map((website, index) => (
                <div
                  key={website._id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleWebsiteClick(website)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 ${getThumbnailGradient(
                        [
                          'orange',
                          'red',
                          'blue',
                          'green',
                          'yellow',
                          'purple',
                          'pink',
                          'indigo',
                          'teal',
                        ][index % 9],
                      )} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {website.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {website.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="w-3 h-3" />
                          <span>
                            Created on:{' '}
                            {new Date(website.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        {website.domain && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {website.domain}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWebsite(website);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                      >
                        <IconEdit className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                      {website.url && (
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
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

          <WebsiteDrawer
            isOpen={isWebsiteDrawerOpen}
            onClose={handleCloseWebsiteDrawer}
            onSuccess={handleWebsiteCreatedOrUpdated}
            website={editingWebsite}
          />
        </>
      )}
    </CmsLayout>
  );
}
