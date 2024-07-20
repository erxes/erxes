import * as React from 'react';
import { useQuery } from '@apollo/client';
import { GET_FAQ_TOPIC } from '../../graphql/queries';
import Card from '../Card.tsx';
import {
  IconFeaturedChevronRight,
  IconFeaturedSearch,
} from '../../../icons/Icons';
import { getMessengerData } from '../../utils/util';
import { useRouter } from '../../context/Router';
import { IFaqCategory } from '../../types';

const Featured = () => {
  const messengerData = getMessengerData();
  const topicId = messengerData.knowledgeBaseTopicId;

  const { goToFaqCategory, setActiveRoute } = useRouter();

  const { data, loading } = useQuery(GET_FAQ_TOPIC, {
    variables: {
      _id: topicId,
    },
  });

  const handleArticleClick = (article: IFaqCategory) => {
    goToFaqCategory(article);
  };

  return (
    <Card p="0.5rem">
      <div className="featured-container">
        <button
          tabIndex={0}
          className="featured-search"
          onClick={() => setActiveRoute('faqCategories')}
        >
          <span>Search for help</span>
          <IconFeaturedSearch />
        </button>
        <ul className="featured-list-container">
          {loading?  <li >
                <div
                  role="button"
                  tabIndex={0}
                  className="featured-list-item"
                >
                  <div className="item-title"></div>
                  <div className="icon-wrapper">
                    <IconFeaturedChevronRight />
                  </div>
                </div>
              </li>:
          data?.knowledgeBaseTopicDetail?.categories?.map(
            (category: IFaqCategory) => (
              <li key={category._id}>
                <div
                  role="button"
                  tabIndex={0}
                  className="featured-list-item"
                  onClick={() => handleArticleClick(category)}
                >
                  <div className="item-title">{category.title}</div>
                  <div className="icon-wrapper">
                    <IconFeaturedChevronRight />
                  </div>
                </div>
              </li>
            )
          )
          }
        </ul>
      </div>
    </Card>
  );
};

export default Featured;
