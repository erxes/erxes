import { Button, DropdownMenu, Spinner } from 'erxes-ui';
import { IconDotsVertical } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';

interface ArticleListProps {
  onEditArticle: (article: any) => void;
}

export function ArticleList({ onEditArticle }: ArticleListProps) {
  const [searchParams] = useSearchParams();
  // const { data, loading } = useQuery(ARTICLES, {
  //   variables: {
  //     categoryIds: [searchParams.get('categoryId') || ''],
  //     page: 1,
  //     perPage: 20,
  //   },
  //   fetchPolicy: 'network-only',
  // });

  const { articles, loading } = useArticles({
    categoryIds: [searchParams.get('categoryId') || ''],
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  // const articles = data?.knowledgeBaseArticles.list || [];

  return (
    <div className="space-y-4">
      {articles.map((article: any) => (
        <div
          key={article._id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <h3 className="text-lg font-medium">{article.title}</h3>
            <p className="text-sm text-gray-500">{article.summary}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Status: {article.status}</span>
              <span>By: {article.createdUser?.details?.fullName}</span>
              <span>
                Created: {new Date(article.createdDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical className="w-4 h-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => onEditArticle(article)}>
                Edit Article
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item className="text-red-600">
                Delete Article
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
