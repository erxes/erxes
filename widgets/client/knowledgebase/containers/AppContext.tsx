import gql from 'graphql-tag';
import * as React from 'react';
import client from '../../apollo-client';
import { IKbArticle, IKbCategory } from '../types';
import graphql from './graphql';

interface IState {
  activeRoute: string;
  activeCategory: IKbCategory | null;
  activeArticle: IKbArticle | null;
  searchString: string;
}

interface IStore extends IState {
  goToCategory: (category: IKbCategory) => void;
  goToArticle: (article: IKbArticle) => void;
  goToArticles: () => void;
  search: (value: string) => void;
  goToCategories: () => void;
  incReactionCount: (articleId: string, reactionChoice: string) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<IState>({
    activeRoute: 'CATEGORIES',
    activeCategory: null,
    activeArticle: null,
    searchString: '',
  });

  const goToCategory = (category: IKbCategory) => {
    setState((prevState) => ({
      ...prevState,
      activeRoute: 'CATEGORY_DETAIL',
      activeCategory: category,
    }));
  };

  const goToArticle = (article: IKbArticle) => {
    setState((prevState) => ({
      ...prevState,
      activeRoute: 'ARTICLE_DETAIL',
      activeArticle: article,
    }));
  };

  const goToCategories = () => {
    setState((prevState) => ({
      ...prevState,
      activeRoute: 'CATEGORIES',
      activeCategory: null,
    }));
  };

  const goToArticles = () => {
    const { activeCategory } = state;

    setState((prevState) => ({
      ...prevState,
      activeRoute: activeCategory ? 'CATEGORY_DETAIL' : 'CATEGORIES',
    }));
  };

  const incReactionCount = (articleId: string, reactionChoice: string) => {
    client.mutate({
      mutation: gql(graphql.incReactionCount),
      variables: {
        articleId,
        reactionChoice,
      },
    });
  };

  const search = (value: string) => {
    let activeRoute = 'CATEGORIES';

    if (value) {
      activeRoute = 'ARTICLES';
    }

    setState((prevState) => ({
      ...prevState,
      searchString: value,
      activeRoute,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        goToCategory,
        goToCategories,
        goToArticle,
        goToArticles,
        incReactionCount,
        search,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
