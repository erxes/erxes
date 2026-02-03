import { IconBook, IconCaretRightFilled, IconFolder, IconSearch, IconPlus, IconDotsVertical, IconFileText } from '@tabler/icons-react';
import { Sidebar, Spinner, cn, Kbd, Input, Button, DropdownMenu, NavigationMenuGroup, TextOverflowTooltip, IconComponent, useQueryState, Collapsible } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTopics } from '../hooks/useTopics';
import { buildCategoryTree } from '../utils/buildGategoryTree';
import { TopicDrawer } from './TopicDrawer';
import { CategoryDrawer } from './CategoryDrawer';
import { useMutation } from '@apollo/client';
import { REMOVE_TOPIC, REMOVE_CATEGORY } from '../graphql/mutations';
import { TopicList } from './TopicList';
import { ITopic, ICategory } from '../types';
import { ICONS } from '../constants';
import { useConfirm } from 'erxes-ui';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full h-4 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

interface TopicItemProps {
  topic: ITopic;
  onEditTopic: (topic: ITopic) => void;
  onAddCategory: (topicId: string) => void;
  onRemoveTopic: (topicId: string) => void;
}

function TopicItem({ topic, onEditTopic, onAddCategory, onRemoveTopic }: TopicItemProps) {
  const [topicId, setTopicId] = useQueryState<string | null>('topicId');
  const isActive = topicId === topic._id;
  
  const renderTopicActions = (topic: ITopic) => (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ml-2 p-1.5 hover:bg-accent rounded-md transition-colors">
        <IconDotsVertical className="w-4 h-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" sideOffset={5}>
        <DropdownMenu.Item onClick={() => onEditTopic(topic)}>
          Edit Topic
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => onAddCategory(topic._id)}
        >
          Add Category
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => onRemoveTopic(topic._id)}
          className="text-red-600"
        >
          Delete Topic
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  return (
    <Sidebar.Group className="p-0">
      <div className="w-full relative group/trigger hover:cursor-pointer">
        <div className="w-full flex items-center justify-between">
          <Sidebar.MenuButton
            isActive={isActive}
            onClick={() => {
              setTopicId(topic._id);
            }}
          >
            <div className="flex items-center gap-2">
              <IconFileText
                className={cn(
                  'text-accent-foreground shrink-0 size-4',
                  isActive && 'text-primary',
                )}
              />
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case flex-1 min-w-0"
                value={topic.title}
              />
            </div>
          </Sidebar.MenuButton>
          <div className="opacity-70 hover:opacity-100 transition">
            {renderTopicActions(topic)}
          </div>
        </div>
      </div>
    </Sidebar.Group>
  );
}

export function KnowledgeBaseSubGroup() {
  const { topics, loading, refetch } = useTopics();
  const [topicId, setTopicId] = useQueryState<string | null>('topicId');
  const [categoryId, setCategoryId] = useQueryState<string | null>('categoryId');
  const [editingTopic, setEditingTopic] = useState<ITopic | undefined>(undefined);
  const [addingCategoryToTopic, setAddingCategoryToTopic] = useState<string | null>(null);

  const [deleteTopic] = useMutation(REMOVE_TOPIC, {
    onCompleted: () => {
      refetch();
    },
  });

  const [removeCategory] = useMutation(REMOVE_CATEGORY);
  const { confirm } = useConfirm();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | undefined>(
    undefined,
  );
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(
    undefined,
  );

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

  const handleRemoveTopic = async (topicId: string) => {
    const topic = topics.find(t => t._id === topicId);
    if (!topic) return;

    const message = `Are you sure you want to delete "${topic.title}"? This will also delete all associated categories and articles. This action cannot be undone.`;

    const confirmOptions = {
      confirmationValue: 'delete',
      description: 'This action is permanent and cannot be undone.',
    };

    try {
      await confirm({
        message,
        options: confirmOptions,
      });

      await deleteTopic({
        variables: {
          _id: topicId,
        },
      }).then(() => {
        refetch();
      });
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleAddCategory = (topicId: string) => {
    setAddingCategoryToTopic(topicId);
  };

  const handleEditTopic = (topic: ITopic) => {
    setEditingTopic(topic);
  };

  const allCategories = topics.flatMap(topic => 
    (topic.categories || []).map(category => ({
      ...category,
      topicId: topic._id,
      topicTitle: topic.title
    }))
  );

  const getIconComponent = (iconName?: string) => {
    const icon = ICONS.find((icon) => icon.value === iconName);
    return icon ? icon.icon : IconFolder;
  };

  const renderCategoryActions = (category: any) => (
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
        <DropdownMenu.Item
          onClick={() => {
            setEditingCategory(category);
            setParentCategoryId(category._id);
            setIsCategoryDrawerOpen(true);
          }}
        >
          Add Sub Category
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => handleDeleteCategory(category)}>
          Delete Category
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  useEffect(() => {
    !topicId && topics?.[0]?._id && setTopicId(topics[0]._id);
  }, [topics, setTopicId, topicId]);

  return (
    <>
      <NavigationMenuGroup name="Topics">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          topics?.map((topic) => (
            <TopicItem 
              key={topic._id} 
              topic={topic}
              onEditTopic={handleEditTopic}
              onAddCategory={handleAddCategory}
              onRemoveTopic={handleRemoveTopic}
            />
          ))
        )}
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Categories">
        {topicId && <Categories 
          onEditCategory={setEditingCategory}
          onSetCategoryDrawerOpen={setIsCategoryDrawerOpen}
          onSetParentCategoryId={setParentCategoryId}
          onDeleteCategory={handleDeleteCategory}
        />}
      </NavigationMenuGroup>

      {editingTopic && (
        <TopicDrawer
          topic={editingTopic}
          isOpen={!!editingTopic}
          onClose={() => setEditingTopic(undefined)}
          onSaved={() => {
            setEditingTopic(undefined);
            refetch();
          }}
        />
      )}

      {addingCategoryToTopic && (
        <CategoryDrawer
          topicId={addingCategoryToTopic}
          isOpen={!!addingCategoryToTopic}
          onClose={() => setAddingCategoryToTopic(null)}
          refetch={refetch}
        />
      )}

      {(editingCategory || isCategoryDrawerOpen) && (
        <CategoryDrawer
          category={editingCategory}
          parentCategoryId={parentCategoryId}
          topicId={topicId || ''}
          isOpen={isCategoryDrawerOpen}
          onClose={() => {
            setEditingCategory(undefined);
            setIsCategoryDrawerOpen(false);
            setParentCategoryId(undefined);
            refetch();
          }}
          refetch={refetch}
        />
      )}
    </>
  );
}

const Categories = ({ 
  onEditCategory, 
  onSetCategoryDrawerOpen, 
  onSetParentCategoryId, 
  onDeleteCategory 
}: {
  onEditCategory: (category: any) => void;
  onSetCategoryDrawerOpen: (open: boolean) => void;
  onSetParentCategoryId: (id: string) => void;
  onDeleteCategory: (category: any) => void;
}) => {
  const [topicId] = useQueryState<string | null>('topicId');
  const [categoryId, setCategoryId] = useQueryState<string | null>('categoryId');
  const { topics } = useTopics();
  
  const selectedTopic = topics.find(topic => topic._id === topicId);
  const topicCategories = selectedTopic?.categories || [];

  const getIconComponent = (iconName?: string) => {
    const icon = ICONS.find((icon) => icon.value === iconName);
    return icon ? icon.icon : IconFolder;
  };

  const renderCategoryActions = (category: any) => (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ml-2 p-2">
        <IconDotsVertical className="w-4 h-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            onEditCategory(category);
            onSetCategoryDrawerOpen(true);
          }}
        >
          Edit Category
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            onEditCategory(undefined);
            onSetParentCategoryId(category._id);
            onSetCategoryDrawerOpen(true);
          }}
        >
          Add Sub Category
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => onDeleteCategory(category)}>
          Delete Category
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ); 

  return (
    <Collapsible.Content className="pt-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {topicCategories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            const isSubmenuActive = categoryId === category._id;
            return (
              <Sidebar.MenuItem key={category._id}>
                <div className="w-full flex items-center justify-between">
                  <Sidebar.MenuButton
                    isActive={isSubmenuActive}
                    onClick={() => {
                      setCategoryId(category._id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className={cn(
                          'text-accent-foreground shrink-0 size-4',
                          isSubmenuActive && 'text-primary',
                        )}
                      />
                      <TextOverflowTooltip
                        className="font-sans font-semibold normal-case flex-1 min-w-0"
                        value={category.title}
                      />
                    </div>
                  </Sidebar.MenuButton>
                  <div className="opacity-70 hover:opacity-100 transition">
                    {renderCategoryActions(category)}
                  </div>
                </div>
              </Sidebar.MenuItem>
            );
          })}
          {!topicCategories?.length && (
            <Sidebar.MenuItem>
              <Sidebar.MenuButton disabled={true}>
                <span className="text-foreground">No categories</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  );
};
