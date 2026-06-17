import { useAtom, useAtomValue } from 'jotai';
import {
  connectionAtom,
  faqArticleIdAtom,
  faqCategoryStackAtom,
} from '../../../states';
import { useGetKnowledgeBaseTopicDetails } from '../../../hooks/useGetKnowledgeBaseTopicDetails';
import { IKnowledgeBaseArticle } from '../../../types/knowledgeBase';
import { IconArrowRight, IconBook } from '@tabler/icons-react';
import { cn, IconComponent } from 'erxes-ui';
import { format } from 'date-fns';

export const CategoryView = () => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect;
  const { knowledgeBaseTopicId } = messengerData || {};
  const categoryStack = useAtomValue(faqCategoryStackAtom);
  const currentCategoryId = categoryStack[categoryStack.length - 1];
  const [, setArticleId] = useAtom(faqArticleIdAtom);
  const [, setCategoryStack] = useAtom(faqCategoryStackAtom);

  const { details, categories } = useGetKnowledgeBaseTopicDetails({
    variables: { _id: knowledgeBaseTopicId },
    skip: !knowledgeBaseTopicId,
  });

  const currentCategory =
    details?.categories?.find((c) => c._id === currentCategoryId) ||
    details?.parentCategories?.find((c) => c._id === currentCategoryId);

  const subCategories =
    categories?.filter((c) => c.parentCategoryId === currentCategoryId) || [];

  const articles = currentCategory?.articles || [];

  const handleSubCategoryClick = (subCatId: string) => {
    setCategoryStack((prev) => [...prev, subCatId]);
  };

  const handleArticleClick = (article: IKnowledgeBaseArticle) => {
    setArticleId(article._id);
  };

  const formatDate = (dateStr: string) => {
    try {
      return `Updated ${format(new Date(dateStr), 'MMM yyyy')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="p-4 flex flex-col gap-2.5 relative">
      {subCategories.length > 0 && (
        <>
          {subCategories.map((subCat, index) => (
            <div
              key={subCat._id}
              className={cn(
                'group rounded-2xl shadow-xs p-3.5 bg-background flex items-center gap-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer hover:shadow-sm',
              )}
              onClick={() => handleSubCategoryClick(subCat._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleSubCategoryClick(subCat._id)
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
                  name={subCat.icon || 'help-circle'}
                  size={20}
                />
              </span>
              <span className="flex-1 overflow-hidden min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  {subCat.title}
                </h2>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {subCat.numOfArticles === 1
                    ? '1 article'
                    : `${subCat.numOfArticles} articles`}
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
        </>
      )}

      {articles.length > 0 && (
        <div className={cn('flex flex-col gap-2')}>
          {subCategories.length > 0 && (
            <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground px-1 pt-1">
              Articles
            </span>
          )}
          {articles.map((article, index) => (
            <div
              key={article._id}
              className={cn(
                'group rounded-2xl shadow-xs p-3.5 bg-background flex items-center gap-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer hover:shadow-sm',
              )}
              onClick={() => handleArticleClick(article)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleArticleClick(article)
              }
            >
              <span className="shrink-0 p-2 rounded-xl bg-muted flex items-center justify-center">
                <IconBook className="text-muted-foreground" size={18} />
              </span>
              <span className="flex-1 overflow-hidden min-w-0">
                <h2 className="text-sm font-semibold text-foreground truncate">
                  {article.title}
                </h2>
                {article.modifiedDate && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {formatDate(article.modifiedDate)}
                  </span>
                )}
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
      )}

      {subCategories.length === 0 && articles.length === 0 && (
        <div className="rounded-2xl shadow-xs p-6 bg-background flex flex-col items-center gap-2 text-center">
          <span className="text-muted-foreground text-sm">
            No articles in this category yet.
          </span>
        </div>
      )}
    </div>
  );
};
