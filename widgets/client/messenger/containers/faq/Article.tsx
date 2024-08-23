import * as React from 'react';
import Article from '../../components/faq/Article';
import { IFaqArticle } from '../../types';
import { useRouter } from '../../context/Router';

type Props = {
  article: IFaqArticle;
};

const Container = (props: Props) => {
  const { goToFaqArticle } = useRouter();

  return <Article {...props} onClick={goToFaqArticle} />;
};

export default Container;
