import gql from 'graphql-tag';
import * as React from 'react';
import DumbCategoryDetail from '../../components/faq/CategoryDetail';
import queries from '../../graphql';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from '../../context/Router';
import { getMessengerData } from '../../utils/util';

const CategoryDetail = ({ loading }: { loading: boolean }) => {
  const { activeFaqCategory } = useRouter();

  const categoryId = activeFaqCategory && activeFaqCategory._id;

  const topicId = getMessengerData().knowledgeBaseTopicId;

  const { data, loading: loadingFaqCategoy } = useQuery(
    gql(queries.getFaqCategoryQuery),
    {
      fetchPolicy: 'network-only',
      variables: {
        _id: categoryId,
      },
    }
  );

  const extendedProps = {
    topicId,
    category: data?.knowledgeBaseCategoryDetail,
    loading: loading || loadingFaqCategoy,
  };

  return <DumbCategoryDetail {...extendedProps} />;
};

export default CategoryDetail;
