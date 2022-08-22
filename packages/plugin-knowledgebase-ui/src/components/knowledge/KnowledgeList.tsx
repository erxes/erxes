import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Header } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';
import KnowledgeForm from '../../containers/knowledge/KnowledgeForm';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';
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
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add Knowledge Base
      </Button>
    );

    const content = props => (
      <KnowledgeForm {...props} renderButton={this.props.renderButton} />
    );

    return (
      <Header>
        <ModalTrigger
          title="Add Knowledge Base"
          autoOpenKey="showKBAddModal"
          trigger={trigger}
          content={content}
          enforceFocus={false}
        />
      </Header>
    );
  }

  render() {
    const { topics, loading } = this.props;

    return (
      <Sidebar wide={true} header={this.renderSidebarHeader()} hasBorder>
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
