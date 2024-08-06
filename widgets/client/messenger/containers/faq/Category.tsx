import * as React from 'react';
import Category from '../../components/faq/Category';
import { IFaqCategory } from '../../types';
import { useRouter } from '../../context/Router';

type Props = {
  category: IFaqCategory;
  childrens?: IFaqCategory[];
  getCurrentItem?: (currentCategory: IFaqCategory) => void;
  isParent?: boolean;
};

const Container = (props: Props) => {
  const { goToFaqCategory } = useRouter();

  return <Category {...props} onClick={goToFaqCategory} />;
};

export default Container;
