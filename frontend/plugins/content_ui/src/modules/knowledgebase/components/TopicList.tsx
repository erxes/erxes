import { useMutation } from '@apollo/client';
import {
  cn,
  Collapsible,
  DropdownMenu,
  Sidebar,
  Spinner,
  useConfirm,
} from 'erxes-ui';

import { IconDotsVertical, IconFolder } from '@tabler/icons-react';

import { ICONS } from '@/knowledgebase/constants';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { REMOVE_CATEGORY } from '../graphql/mutations';
import { useTopics } from '../hooks/useTopics';
import { ICategory, ITopic } from '../types';
import { CategoryDrawer } from './CategoryDrawer';

interface TopicListProps {
  topics: ITopic[];
  loading: boolean;

  removeTopic: (topicId: string) => void;
  onEditTopic: (topic: ITopic) => void;
}

export function TopicList(props: TopicListProps) {
  const { topics, loading, removeTopic, onEditTopic } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && topics.length > 0) {
      const topicId = searchParams.get('topicId');

      const firstTopic = topics[0];

      const newParams: Record<string, string> = {};

      if (!topicId && firstTopic) {
        newParams.topicId = firstTopic._id;
      }

      if (Object.keys(newParams).length > 0) {
        setSearchParams((prev) => {
          const updated = new URLSearchParams(prev.toString());
          Object.entries(newParams).forEach(([key, value]) =>
            updated.set(key, value),
          );
          return updated;
        });
      }
    }
  }, [loading, searchParams, setSearchParams, topics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <Sidebar.Group>
        <Collapsible.Content>
          <Sidebar.GroupContent className="pt-2">
            <Sidebar.Menu>
              {topics.map((topic) => {
                return (
                  <TopicItem
                    key={topic._id}
                    topic={topic}
                    removeTopic={removeTopic}
                    onEditTopic={onEditTopic}
                  />
                );
              })}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

export function TopicItem(props: {
  topic: ITopic;
  removeTopic: (topicId: string) => void;
  onEditTopic: (topic: ITopic) => void;
}) {
  const [removeCategory] = useMutation(REMOVE_CATEGORY);
  const { refetch } = useTopics();
  const { topic, removeTopic, onEditTopic } = props;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { confirm } = useConfirm();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(
    undefined,
  );
  const [editingCategory, setEditingCategory] = useState<ICategory | undefined>(
    undefined,
  );
  const isActive = topic._id === searchParams.get('topicId');
  const parentCategories = topic.parentCategories ?? [];

  const handleDeleteTopic = async (topic: ITopic) => {
    const categoryCount = topic.categories?.length || 0;
    const message = `Are you sure you want to delete "${topic.title}"? This will also delete ${categoryCount} categories and all their associated articles. This action cannot be undone.`;

    const confirmOptions = {
      confirmationValue: 'delete',
      description: 'This action is permanent and cannot be undone.',
    };

    try {
      await confirm({
        message,
        options: confirmOptions,
      });

      removeTopic(topic._id);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleDeleteCategory = async (category: ICategory) => {
    const message = `Are you sure you want to delete "${category.title}"? This will also delete all associated articles. This action cannot be undone.`;

    const confirmOptions = {
      confirmationValue: 'delete',
      description: 'This action is permanent and cannot be undone.',
    };

    try {
      await confirm({
        message,
        options: confirmOptions,
      });

      await removeCategory({
        variables: {
          _id: category._id,
        },
      }).then(() => {
        refetch();
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const renderTopicActions = (topic: ITopic) => (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ml-2 p-2">
        <IconDotsVertical className="w-4 h-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => onEditTopic(topic)}>
          Edit Topic
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            setIsCategoryDrawerOpen(true);
          }}
        >
          Add Category
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => handleDeleteTopic(topic)}
          className="text-red-600"
        >
          Delete Topic
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  const renderCategoryActions = (
    category: ICategory,
    isSubCategory?: boolean,
  ) => (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ml-2 p-2">
        <IconDotsVertical className="w-4 h-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            setEditingCategory(category);
            setIsCategoryDrawerOpen(true);
          }}
        >
          Edit Category
        </DropdownMenu.Item>
        {!isSubCategory && (
          <DropdownMenu.Item
            onClick={() => {
              setParentCategoryId(category._id);
              setIsCategoryDrawerOpen(true);
            }}
          >
            Add Sub Category
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => handleDeleteCategory(category)}>
          Delete Category
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  const getIconComponent = (iconName?: string) => {
    const icon = ICONS.find((icon) => icon.value === iconName);
    return icon ? icon.icon : IconFolder;
  };

  return (
    <>
      <Collapsible asChild open={isActive} className="group/collapsible">
        <Sidebar.MenuItem key={topic._id}>
          <Sidebar.MenuButton
            onClick={() => {
              navigate(`?topicId=${topic._id}`);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <span>{topic.title}</span>
              {renderTopicActions(topic)}
            </div>
          </Sidebar.MenuButton>
          {parentCategories.length > 0 && (
            <Collapsible.Content asChild>
              <Sidebar.Sub>
                {parentCategories.map((cat) => {
                  const IconComponent = getIconComponent(cat.icon);
                  const isSubmenuActive =
                    cat._id === searchParams.get('categoryId');
                  return (
                    <Sidebar.SubItem key={cat._id}>
                      <Sidebar.SubButton
                        asChild
                        isActive={isSubmenuActive}
                        className="w-full"
                      >
                        <div className="flex items-center justify-between w-full">
                          <Link
                            to={`?topicId=${topic._id}&categoryId=${cat._id}`}
                            className="flex items-center gap-2 flex-grow"
                          >
                            <span className="w-5 flex justify-center">
                              {IconComponent && (
                                <IconComponent
                                  className={cn(
                                    'text-accent-foreground',
                                    isSubmenuActive && 'text-primary',
                                  )}
                                />
                              )}
                            </span>
                            <span>{cat.title}</span>
                          </Link>

                          {renderCategoryActions(cat)}
                        </div>
                      </Sidebar.SubButton>
                      {cat.children && cat.children.length > 0 && (
                        <div className="ml-4 space-y-1 mt-1">
                          {cat.children.map((sub) => {
                            const isSubActive =
                              sub._id === searchParams.get('categoryId');
                            const IconComponent = getIconComponent(sub.icon);
                            return (
                              <div
                                key={sub._id}
                                className="group/menu-item relative"
                              >
                                <div
                                  className={cn(
                                    'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-none font-semibold hover:bg-accent focus-visible:ring-2 active:bg-accent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 text-sm group-data-[collapsible=icon]:hidden',
                                    isSubActive &&
                                      'bg-primary/10 text-primary font-semibold',
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <Link
                                      to={`?topicId=${topic._id}&categoryId=${sub._id}`}
                                      className="flex items-center gap-2 flex-grow"
                                    >
                                      <span className="w-5 flex justify-center">
                                        {IconComponent && (
                                          <IconComponent
                                            className={cn(
                                              'text-accent-foreground',
                                              isSubActive && 'text-primary',
                                            )}
                                          />
                                        )}
                                      </span>
                                      <span>{sub.title}</span>
                                    </Link>

                                    {renderCategoryActions(sub, true)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Sidebar.SubItem>
                  );
                })}
              </Sidebar.Sub>
            </Collapsible.Content>
          )}
        </Sidebar.MenuItem>
      </Collapsible>

      <CategoryDrawer
        refetch={refetch}
        topicId={searchParams.get('topicId') || ''}
        parentCategoryId={parentCategoryId}
        category={editingCategory}
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />
    </>
  );
}
