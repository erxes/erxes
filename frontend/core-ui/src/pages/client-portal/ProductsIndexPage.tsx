import { Button, PageContainer, Spinner } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useClientPortalConfigs } from '@/client-portal/hooks/useClientPortalConfigs';
import { Link, useNavigate } from 'react-router-dom';
import { ClientPortalPath } from '@/types/paths/ClientPortalPath';
import { AppPath } from '@/types/paths/AppPath';
import { ToggleGroup, useToast } from 'erxes-ui';
import { CLIENT_PORTAL_GET_CONFIGS } from '@/client-portal/graphql/queries';
import { CLIENT_PORTAL_REMOVE } from '@/client-portal/graphql/mutations';
import {
  IconLayoutGrid,
  IconList,
  IconEdit,
  IconTrash,
  IconArrowUpRight,
  IconWorldX,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { NoWebsiteEmptyState } from '@/client-portal/components/NoWebsiteEmptyState';

export const ClientPortalIndexPage = () => {
  const { configs, loading } = useClientPortalConfigs({ limit: 10 });
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('thumbnail');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [removePortal, { loading: removing }] = useMutation(
    CLIENT_PORTAL_REMOVE,
    {
      refetchQueries: [
        { query: CLIENT_PORTAL_GET_CONFIGS, variables: { limit: 10 } },
      ],
      awaitRefetchQueries: true,
    },
  );

  const displayWebsites = useMemo(() => configs, [configs]);

  const getThumbnailGradient = (color: string) => {
    const map: Record<string, string> = {
      orange: 'bg-gradient-to-br from-orange-400 to-rose-500',
      red: 'bg-gradient-to-br from-rose-500 to-red-600',
      blue: 'bg-gradient-to-br from-sky-500 to-indigo-600',
      green: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      yellow: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      purple: 'bg-gradient-to-br from-violet-500 to-purple-600',
      pink: 'bg-gradient-to-br from-pink-500 to-fuchsia-600',
      indigo: 'bg-gradient-to-br from-indigo-500 to-blue-700',
      teal: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    };
    return map[color] || map.orange;
  };

  const handleWebsiteClick = (website: any) => {
    console.log('open website', website);
  };

  const handleEditWebsite = (website: any) => {
    navigate(`${website._id}`);
  };
  const handleDeleteWebsite = async (website: any) => {
    const ok = window.confirm(
      `Delete "${website.name}"? This cannot be undone.`,
    );
    if (!ok) return;
    try {
      await removePortal({ variables: { _id: website._id } });
      toast({ title: 'Deleted', description: 'Website removed successfully.' });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: (e as any)?.message || 'Failed to delete',
        variant: 'destructive',
      });
    }
  };
  return (
    <PageContainer>
      <div className="px-4">
        {loading ? (
          <div className="mt-4">
            <Spinner />
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Found {displayWebsites.length} results
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

            {displayWebsites.length === 0 ? (
              <NoWebsiteEmptyState />
            ) : viewMode === 'thumbnail' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {displayWebsites.map((website, index) => (
                  <div
                    key={website._id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {website.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {website.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between">
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWebsite(website);
                            }}
                            disabled={removing}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <IconTrash className="w-3 h-3" />
                            <span>Delete</span>
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
                        <div className="flex items-center gap-4 text-xs text-gray-500" />
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWebsite(website);
                          }}
                          disabled={removing}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <IconTrash className="w-3 h-3" />
                          <span>Delete</span>
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
          </div>
        )}
      </div>
    </PageContainer>
  );
};
