import Button from '@erxes/ui/src/components/Button';
import { Columns, Column } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IAsset } from '../../common/types';
import { KbArticles, KbCategories, KbTopics } from '../../style';
import { EmptyState } from '@erxes/ui/src';
import { ContainerBox } from '../../style';

type Props = {
  objects: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
  knowledgeData?: any;
};

type State = {
  topicsToShow: string[];
  selectedArticleIds: string[];
  action: string;
};

class AssignArticles extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      action: 'add',
      topicsToShow: [],
      selectedArticleIds: []
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (
      JSON.stringify(prevProps.loadedArticles) !==
      JSON.stringify(this.props.loadedArticles)
    ) {
      const { loadedArticles, knowledgeData } = this.props;
      if (!!loadedArticles?.length && knowledgeData) {
        const loadedArticleIds = loadedArticles.map(article => article._id);
        let selectedArticleIds: any = [];
        for (const category of knowledgeData) {
          const contentIds = (category?.contents || [])
            .map(content =>
              loadedArticleIds.includes(content._id) ? content._id : ''
            )
            .filter(contentId => contentId);
          selectedArticleIds = [...selectedArticleIds, ...contentIds];
        }

        this.setState(prev => ({
          selectedArticleIds: [
            ...prev.selectedArticleIds,
            ...selectedArticleIds
          ]
        }));
      }
    }
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const { selectedArticleIds, action } = this.state;
    const { objects } = this.props;

    this.props.save({
      ids: objects.map(asset => asset._id),
      data: {
        action,
        articleIds: selectedArticleIds
      },
      callback: () => {
        this.props.closeModal();
      }
    });
  };

  onChangeAction = e => {
    this.setState({ action: e.currentTarget.value });
  };

  renderCategories(topic) {
    const { categories } = topic;
    const { topicsToShow } = this.state;
    const { knowledgeData } = this.props;

    if (!topicsToShow.includes(topic._id)) {
      return null;
    }

    const renderCount = cat => {
      if (!knowledgeData?.length) {
        return null;
      }

      return (
        <div>{`${countSelectedArticles(cat._id)}/${cat.numOfArticles}`}</div>
      );
    };

    const countSelectedArticles = categoryId => {
      const category = (knowledgeData || []).find(
        cat => cat._id === categoryId
      );
      const { contents } = category || {};

      const count = (contents || [])?.length;

      return count;
    };

    return categories.map(cat => {
      const onClick = () => {
        this.props.loadArticles(cat._id);
      };

      return (
        <KbCategories key={cat._id} onClick={onClick}>
          <ContainerBox spaceBetween>
            <div>{cat.title}</div>
            {renderCount(cat)}
          </ContainerBox>
        </KbCategories>
      );
    });
  }

  showTopic = topicId => {
    const { topicsToShow } = this.state;

    topicsToShow.push(topicId);

    this.setState({ topicsToShow });
  };

  renderTopics() {
    const { kbTopics } = this.props;

    return kbTopics.map(topic => {
      return (
        <KbTopics
          key={topic._id}
          onClick={this.showTopic.bind(this, topic._id)}
        >
          {topic.title}

          {this.renderCategories(topic)}
        </KbTopics>
      );
    });
  }

  renderLoadedArticles() {
    const { loadedArticles } = this.props;
    const { topicsToShow } = this.state;

    if (!loadedArticles?.length && !!topicsToShow?.length) {
      return (
        <EmptyState
          text="There has no article in this knowledgebase category"
          image="/images/actions/5.svg"
        />
      );
    }

    return loadedArticles.map(article => {
      const onClick = e => {
        const id = e.currentTarget.value;

        const { selectedArticleIds } = this.state;

        if (selectedArticleIds.includes(id)) {
          const index = selectedArticleIds.indexOf(id);
          selectedArticleIds.splice(index, 1);
        } else {
          selectedArticleIds.push(e.currentTarget.value);
        }

        this.setState({ selectedArticleIds });
      };

      const { selectedArticleIds } = this.state;

      return (
        <KbArticles key={article._id}>
          <input
            type="checkbox"
            value={article._id}
            onClick={onClick}
            defaultChecked={false}
            checked={selectedArticleIds.includes(article._id)}
          />
          {article.title}
        </KbArticles>
      );
    });
  }

  render() {
    const { closeModal } = this.props;
    const { action } = this.state;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column>{this.renderTopics()}</Column>

          <Column>{this.renderLoadedArticles()}</Column>
        </Columns>

        <ModalFooter>
          <select onChange={this.onChangeAction} value={action}>
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
          </select>

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
