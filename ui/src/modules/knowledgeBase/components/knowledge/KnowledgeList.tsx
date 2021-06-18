import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import Sidebar from 'modules/layout/components/Sidebar';
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
      <>
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
      </>
    );
  }

  renderSidebarHeader() {
    const trigger = (
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="plus-circle"
      >
        Add Knowledge Base
      </Button>
    );

    const content = props => (
      <KnowledgeForm {...props} renderButton={this.props.renderButton} />
    );

    return (
      <TopHeader>
        <ModalTrigger
          title="Add Knowledge Base"
          autoOpenKey="showKBAddModal"
          trigger={trigger}
          content={content}
          enforceFocus={false}
        />
      </TopHeader>
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
