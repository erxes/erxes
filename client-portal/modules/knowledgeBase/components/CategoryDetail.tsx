import { Col, Container, Row } from 'react-bootstrap';
import { Config, IUser, Topic } from '../../types';

import ArticleListContainer from '../containers/ArticleList';
import { Card } from '../../styles/cards';
import React from 'react';
import SectionHeader from '../../common/SectionHeader';
import SideBar from './SideBar';
import { SidebarList } from './styles';
import { getConfigColor } from '../../common/utils';

type Props = {
  category: any;
  loading: boolean;
  topic: Topic;
  config: Config;
  currentUser?: IUser;
};

function CategoryDetail({ topic, category, config, currentUser }: Props) {
  return (
    <Container className="knowledge-base">
      <SectionHeader
        categories={topic.parentCategories}
        selectedCat={category}
      />

      <Row className="category-detail">
        <Col md={4}>
          <Card>
            <SidebarList baseColor={getConfigColor(config, 'baseColor')}>
              <SideBar
                parentCategories={topic.parentCategories}
                category={category}
                config={config}
              />
            </SidebarList>
          </Card>
        </Col>
        <Col md={8}>
          <ArticleListContainer
            categoryId={category._id}
            config={config}
            currentUser={currentUser}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default CategoryDetail;
