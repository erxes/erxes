import React, { useEffect, useRef } from 'react';
import { ApolloError } from '@apollo/client';
import { ITemplate } from '../types/types';
import TemplateActions from './TemplateActions';
import { TextOverflowTooltip } from 'erxes-ui';

interface IProps {
  templates: ITemplate[];
  loading: boolean;
  error?: ApolloError;
  totalCount: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefetch: () => void;
  onEdit: (template: ITemplate) => void;
}

const TemplatesList: React.FC<IProps> = ({
  templates,
  loading,
  error,
  totalCount,
  hasNextPage,
  onLoadMore,
  onRefetch,
  onEdit,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || loading || !hasNextPage) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage) {
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasNextPage, onLoadMore]);

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No templates found</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto p-6 bg-sidebar"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => (
          <div
            key={template._id}
            className="bg-card rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-4 border-b">
              <TextOverflowTooltip
                value={template.name}
                className="font-semibold text-base block"
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {template.contentType}
                </span>
                {template.pluginType && (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {'->'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {template.pluginType}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 min-h-[100px] bg-muted/50">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.description || 'No description'}
              </p>
            </div>

            {/* Footer */}
            <div className="p-3 border-t flex items-center justify-between">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  template.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {template.status || 'active'}
              </span>
              <TemplateActions
                template={template}
                onRefetch={onRefetch}
                onEdit={onEdit}
              />
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div ref={sentinelRef} className="mt-6 flex justify-center">
          {loading ? (
            <p className="text-muted-foreground">Loading more...</p>
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {/* Show total count */}
      {!hasNextPage && totalCount > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          All {totalCount} templates loaded
        </div>
      )}
    </div>
  );
};

export default TemplatesList;
