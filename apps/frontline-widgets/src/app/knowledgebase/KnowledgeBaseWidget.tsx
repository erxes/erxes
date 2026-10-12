import { useState } from 'react';
import { KbContent } from './components/KbContent';
import { KbHeader } from './components/KbHeader';
import { useKbNavigation } from './hooks/useKbNavigation';
import { useKnowledgeBaseTopic } from './hooks/useKnowledgeBaseTopic';

export const KnowledgeBaseWidget = () => {
  const { topic, categories, isFloating, isLoading, isUnavailable } =
    useKnowledgeBaseTopic();
  const { canGoBack, category, article, openCategory, openArticle, back } =
    useKbNavigation(categories);
  const [term, setTerm] = useState('');

  const heading = article ? '' : category?.title || topic?.title || 'Help';

  return (
    <div className="flex h-dvh flex-col bg-sidebar">
      <KbHeader
        topic={topic}
        heading={heading}
        canGoBack={canGoBack}
        isFloating={isFloating}
        term={term}
        onBack={back}
        onTermChange={setTerm}
      />

      <main className="flex-1 overflow-y-auto p-4">
        <KbContent
          isUnavailable={isUnavailable}
          isLoading={isLoading}
          categories={categories}
          category={category}
          article={article}
          term={term}
          onOpenCategory={openCategory}
          onOpenArticle={openArticle}
        />
      </main>
    </div>
  );
};
