import { Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { HelperButtons } from 'modules/layout/styles';
import * as React from 'react';
import { KnowledgeForm } from '../../containers';
import { ITopic } from '../../types';
import { KnowledgeRow } from './';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  count?: number;
  loading: boolean;
  topics: ITopic[];
  articlesCount: number;

  save: (
    params: {
      doc: {
        doc: {
          title: string;
          description: string;
          brandId: string;
          languageCode: string;
          color: string;
        };
      };
    },
    callback: () => void,
    object: any
  ) => void;
  remove: (_id: string) => void;
};

class KnowledgeList extends React.Component<Props> {
  renderTopics() {
    const {
      topics,
      remove,
      save,
      currentCategoryId,
      queryParams,
      articlesCount
    } = this.props;

    return (
      <React.Fragment>
        {topics.map(topic => (
          <KnowledgeRow
            currentCategoryId={currentCategoryId}
            key={topic._id}
            topic={topic}
            queryParams={queryParams}
            articlesCount={articlesCount}
            remove={remove}
            save={save}
          />
        ))}
      </React.Fragment>
    );
  }

  renderSidebarHeader() {
    const { Header } = Sidebar;
    const { save } = this.props;

    const trigger = (
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    return (
      <Header uppercase>
        {__('Knowledge base')}
        <ModalTrigger
          title="Add Knowledge base"
          trigger={trigger}
          content={props => <KnowledgeForm {...props} save={save} />}
        />
      </Header>
    );
  }

  render() {
    return (
      <Sidebar full wide header={this.renderSidebarHeader()}>
        {this.renderTopics()}
      </Sidebar>
    );
  }
}

export default KnowledgeList;
