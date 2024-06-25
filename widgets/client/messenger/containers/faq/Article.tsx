import * as React from 'react';
import Article from '../../components/faq/Article';
import { IFaqArticle } from '../../types';
import { useAppContext } from '../AppContext';

type Props = {
  article: IFaqArticle;
};

const Container = (props: Props) => {
  const { goToFaqArticle } = useAppContext();

  return <Article {...props} onClick={goToFaqArticle} />;
};

export default Container;
