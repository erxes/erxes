import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __, categories } from '@erxes/ui/src/utils';
import React from 'react';
import { IAsset } from '../../common/types';
import {
  KbArticles,
  KbArticlesContainer,
  KbCategories,
  TriggerTabs
} from '../../style';
import {
  ControlLabel,
  EmptyState,
  FormControl,
  TabTitle,
  Tabs
} from '@erxes/ui/src';
import { ContainerBox } from '../../style';

type Props = {
  objects?: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
  selectedArticleIds?: string[];
};

type State = {
  topicId: string;
  categoriesToShow: string[];
  selectedArticleIds: string[];
};

class AssignArticles extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      topicId: '',
      categoriesToShow: [],
      selectedArticleIds: props?.selectedArticleIds || []
    };
  }

  componentDidMount() {
    if (!this.state?.topicId && this.props?.kbTopics?.length) {
      const topic = this.props?.kbTopics[0] || {};
      this.selectTopic(topic);
    }
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const { selectedArticleIds } = this.state;
    const { objects } = this.props;

    this.props.save({
      ids: (objects || []).map(asset => asset._id),
      data: {
        articleIds: selectedArticleIds
      },
      callback: () => {
        this.setState({
          selectedArticleIds: this.props.selectedArticleIds || []
        });
        this.props.closeModal();
      }
    });
  };

  selectTopic(topic) {
    const { loadArticles } = this.props;

    const categoryIds = (topic?.categories || []).map(category => category._id);

    loadArticles(categoryIds);

    this.setState({ topicId: topic._id });
  }

  renderCategories() {
    const { topicId, selectedArticleIds, categoriesToShow } = this.state;
    const { kbTopics, loadedArticles } = this.props;

    if (!topicId) {
      return;
    }

    const { categories } = kbTopics.find(topic => topic._id === topicId) || {};

    if (!categories?.length) {
      return (
        <EmptyState text="There is no categories on topic" icon="list-ul" />
      );
    }

    const selectAllArticles = categoryId => {
      const articleIds = loadedArticles
        .filter(article => article.categoryId === categoryId)
        .map(article => article._id);

      if (
        articleIds.every(articleId => selectedArticleIds.includes(articleId))
      ) {
        const updatedSelectedArticleIds = selectedArticleIds.filter(
          articleId => !articleIds.includes(articleId)
        );
        return this.setState({ selectedArticleIds: updatedSelectedArticleIds });
      }

      this.setState({
        selectedArticleIds: [...selectedArticleIds, ...articleIds]
      });
    };

    return categories.map(cat => {
      const onClick = () => {
        if (categoriesToShow.includes(cat._id)) {
          const updateCategoryIds = categoriesToShow.filter(
            categoryId => categoryId !== cat._id
          );
          return this.setState({ categoriesToShow: updateCategoryIds });
        }

        this.setState({ categoriesToShow: [...categoriesToShow, cat._id] });
      };

      const articleIds = loadedArticles
        .filter(article => article.categoryId === cat._id)
        .map(article => article._id);

      const checked =
        !!articleIds?.length &&
        articleIds.every(articleId => selectedArticleIds.includes(articleId));

      const countArticles =
        articleIds.filter(articleId => selectedArticleIds.includes(articleId))
          ?.length || 0;

      return (
        <>
          <KbCategories key={cat._id} onClick={onClick}>
            <ContainerBox spaceBetween>
              <ContainerBox gap={5} align="center">
                <FormControl
                  componentClass="checkbox"
                  onChange={selectAllArticles.bind(this, cat._id)}
                  checked={checked}
                />
                <ControlLabel>
                  <div>{cat.title}</div>
                </ControlLabel>
              </ContainerBox>
              <p>{`${countArticles}/${cat.numOfArticles}`}</p>
            </ContainerBox>
          </KbCategories>
          {categoriesToShow.includes(cat._id) &&
            this.renderLoadedArticles(cat._id)}
        </>
      );
    });
  }

  renderTopics() {
    const { kbTopics } = this.props;
    const { topicId } = this.state;
    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {kbTopics.map(topic => (
              <TabTitle
                key={topic._id}
                onClick={this.selectTopic.bind(this, topic)}
                className={topicId === topic._id ? 'active' : ''}
              >
                {topic.title}
              </TabTitle>
            ))}
          </Tabs>
        </TriggerTabs>
        {this.renderCategories()}
      </>
    );
  }

  renderLoadedArticles(categoryId) {
    const { loadedArticles } = this.props;

    const articles = loadedArticles.filter(
      article => article.categoryId === categoryId
    );

    if (!articles?.length) {
      return (
        <EmptyState
          text="There has no article in this knowledgebase category"
          icon="list-ul"
        />
      );
    }

    return (
      <KbArticlesContainer>
        {articles.map(article => {
          const { selectedArticleIds } = this.state;
          const onClick = () => {
            const articleId = article._id;

            if (selectedArticleIds.includes(articleId)) {
              const index = selectedArticleIds.indexOf(articleId);
              selectedArticleIds.splice(index, 1);
            } else {
              selectedArticleIds.push(articleId);
            }

            this.setState({ selectedArticleIds });
          };

          return (
            <KbArticles key={article._id}>
              <ContainerBox gap={5}>
                <FormControl
                  componentClass="checkbox"
                  checked={selectedArticleIds.includes(article._id)}
                  onClick={onClick}
                />
                {article.title}
              </ContainerBox>
            </KbArticles>
          );
        })}
      </KbArticlesContainer>
    );
  }

  render() {
    const { closeModal } = this.props;

    return (
      <form onSubmit={this.save}>
        {this.renderTopics()}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          <Button type="submit" btnStyle="success" icon={'check-circle'}>
            Assign
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default AssignArticles;
