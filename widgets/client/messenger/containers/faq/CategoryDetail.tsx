import gql from 'graphql-tag';
import * as React from 'react';
import DumbCategoryDetail from '../../components/faq/CategoryDetail';
import queries from '../../graphql';
import { useAppContext } from '../AppContext';
import { useQuery } from '@apollo/react-hooks';

const CategoryDetail = () => {
  const { changeRoute, activeFaqCategory, getMessengerData } = useAppContext();
  const goToCategories = () => {
    changeRoute('conversationList');
  };

  const categoryId = activeFaqCategory && activeFaqCategory._id;

  const topicId = getMessengerData().knowledgeBaseTopicId;

  const { data, loading } = useQuery(gql(queries.getFaqCategoryQuery), {
    fetchPolicy: 'network-only',
    variables: {
      _id: categoryId,
    },
  });

  if (loading) return null;

  const extendedProps = {
    goToCategories,
    topicId,
    category: data?.knowledgeBaseCategoryDetail,
    loading,
  };

  return <DumbCategoryDetail {...extendedProps} />;
};

export default CategoryDetail;
