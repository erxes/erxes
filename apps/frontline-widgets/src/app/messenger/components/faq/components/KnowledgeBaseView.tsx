import { useAtom, useAtomValue } from 'jotai';
import { useGetKnowledgeBaseTopicDetails } from '../../../hooks/useGetKnowledgeBaseTopicDetails';
import {
  connectionAtom,
  faqCategoryStackAtom,
  faqCurrentViewAtom,
} from '../../../states';
import { cn, Empty, IconComponent } from 'erxes-ui';
import { IconArrowRight, IconBook } from '@tabler/icons-react';
import { CategoryView } from './CategoryView';
import { ArticleView } from './ArticleView';

export const KnowledgeBaseView = () => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect;
  const { knowledgeBaseTopicId } = messengerData || {};
  const { details, parentCategories, error } = useGetKnowledgeBaseTopicDetails({
    variables: { _id: knowledgeBaseTopicId },
    skip: !knowledgeBaseTopicId,
  });

  const currentView = useAtomValue(faqCurrentViewAtom);
  const [_, setCategoryStack] = useAtom(faqCategoryStackAtom);

  const handleCategoryClick = (categoryId: string) => {
    setCategoryStack((prev) => [...prev, categoryId]);
  };

  if (currentView === 'category') return <CategoryView />;
  if (currentView === 'article') return <ArticleView />;

  if (error) {
    return (
      <Empty className="py-32 text-foreground">
        <Empty.Header>
          <Empty.Media>
            <IconBook />
          </Empty.Media>
          <Empty.Title>{error.name}</Empty.Title>
          <Empty.Description>{error.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div className={cn('px-4 flex flex-col gap-2.5 relative z-30')}>
      {parentCategories &&
        parentCategories.map((parent, index) => (
          <div
            key={parent._id}
            className={cn(
              { '-mt-8': index === 0 },
              'group rounded-2xl shadow-xs p-3.5 bg-background flex items-center gap-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer hover:shadow-sm',
            )}
            onClick={() => handleCategoryClick(parent._id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleCategoryClick(parent._id)
            }
          >
            <span
              className="shrink-0 p-2 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor:
                  `color-mix(in srgb, ${details?.color} 60%, transparent)` ||
                  'color-mix(in oklch, var(--primary) 60%, transparent)',
              }}
            >
              <IconComponent
                className="text-primary-foreground"
                name={parent.icon || 'help-circle'}
                size={20}
              />
            </span>
            <span className="flex-1 overflow-hidden min-w-0">
              <h1 className="text-base font-semibold text-foreground">
                {parent.title}
              </h1>
              <p className="text-xs font-light mt-0.5 line-clamp-2 whitespace-break-spaces truncate text-accent-foreground">
                {parent.description}
              </p>
              <span className="text-[11px] text-muted-foreground font-medium">
                {parent.numOfArticles === 1
                  ? '1 article'
                  : `${parent.numOfArticles} articles`}
                {parent.childrens?.length
                  ? ` · ${parent.childrens.length} sections`
                  : ''}
              </span>
            </span>
            <span className="shrink-0">
              <IconArrowRight
                className="text-muted-foreground group-hover:translate-x-0.5 transition-all ease-in-out delay-300"
                size={18}
              />
            </span>
          </div>
        ))}
    </div>
  );
};
