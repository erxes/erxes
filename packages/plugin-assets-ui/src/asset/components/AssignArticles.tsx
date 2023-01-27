import Button from '@erxes/ui/src/components/Button';
import { Columns, Column } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IAsset } from '../../common/types';
import { KbArticles, KbCategories, KbTopics } from '../../style';

type Props = {
  objects: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
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

    if (!topicsToShow.includes(topic._id)) {
      return null;
    }

    return categories.map(cat => {
      const onClick = () => {
        this.props.loadArticles(cat._id);
      };

      return <KbCategories onClick={onClick}>{cat.title}</KbCategories>;
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
        <KbTopics onClick={this.showTopic.bind(this, topic._id)}>
          {topic.title}

          {this.renderCategories(topic)}
        </KbTopics>
      );
    });
  }

  renderLoadedArticles() {
    const { loadedArticles } = this.props;

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
        <KbArticles>
          <input
            type="checkbox"
            value={article._id}
            onClick={onClick}
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
