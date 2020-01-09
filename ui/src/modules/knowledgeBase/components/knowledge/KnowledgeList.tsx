import DataWithLoader from 'modules/common/components/DataWithLoader';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { HelperButtons } from 'modules/layout/styles';
import React from 'react';
import KnowledgeForm from '../../containers/knowledge/KnowledgeForm';
import { ITopic } from '../../types';
import KnowledgeRow from './KnowledgeRow';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  count?: number;
  loading: boolean;
  topics: ITopic[];
  articlesCount: number;
  refetch: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (knowledgeBaseId: string) => void;
};

class KnowledgeList extends React.Component<Props> {
  renderTopics() {
    const {
      topics,
      remove,
      renderButton,
      currentCategoryId,
      queryParams,
      articlesCount,
      refetch
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
            renderButton={renderButton}
            refetchTopics={refetch}
          />
        ))}
      </React.Fragment>
    );
  }

  renderSidebarHeader() {
    const { Header } = Sidebar;

    const trigger = (
      <HelperButtons>
        <button>
          <Icon icon="add" />
        </button>
      </HelperButtons>
    );

    const content = props => (
      <KnowledgeForm {...props} renderButton={this.props.renderButton} />
    );

    return (
      <Header uppercase={true}>
        {__('Knowledge base')}
        <ModalTrigger
          title="Add Knowledge base"
          autoOpenKey="showKBAddModal"
          trigger={trigger}
          content={content}
        />
      </Header>
    );
  }

  render() {
    const { topics, loading } = this.props;

    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={this.renderTopics()}
          loading={loading}
          count={topics.length}
          emptyText="There is no knowledge base"
          emptyImage="/images/actions/18.svg"
        />
      </Sidebar>
    );
  }
}

export default KnowledgeList;
