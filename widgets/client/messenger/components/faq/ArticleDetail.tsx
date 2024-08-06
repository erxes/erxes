import * as dayjs from 'dayjs';
import * as React from 'react';
import { __, makeClickableLink } from '../../../utils';
import { IFaqArticle, IFaqCategory } from '../../types';
import Container from '../common/Container';

type Props = {
  article: IFaqArticle | null;
  goToCategory: (category?: IFaqCategory) => void;
  loading: boolean;
};

const ArticleDetail: React.FC<Props> = (props) => {
  React.useEffect(() => {
    makeClickableLink('.erxes-article-content a');
  }, []);

  const renderHead = (title: string) => {
    if (props.loading) return <div className="loader" />;
    return (
      <div className="erxes-topbar-title limited">
        <div>{title}</div>
      </div>
    );
  };

  const { article, goToCategory } = props;

  if (!article) {
    return <div className="loader bigger" />;
  }

  const { createdDate, title, summary, content } = article;

  const onClick = () => {
    goToCategory();
  };

  return (
    <Container title={renderHead(title)} onBackButton={onClick}>
      <div className="erxes-content">
        <div className="erxes-content slide-in">
          <div className="erxes-article-content">
            <h2>{title}</h2>
            <div className="date">
              {__('Created ')}: <span>{dayjs(createdDate).format('lll')}</span>
            </div>
            <p>{summary}</p>
            <p dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ArticleDetail;
