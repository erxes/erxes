import * as React from 'react';
import Category from '../../components/faq/Category';
import { IFaqCategory } from '../../types';
import { useAppContext } from '../AppContext';

type Props = {
  category: IFaqCategory;
  childrens?: IFaqCategory[];
  getCurrentItem?: (currentCategory: IFaqCategory) => void;
};

const Container = (props: Props) => {
  const { goToFaqCategory } = useAppContext();

  return <Category {...props} onClick={goToFaqCategory} />;
};

export default Container;
