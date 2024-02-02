import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { Header } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITopic } from '@erxes/ui-knowledgebase/src/types';
import KnowledgeForm from '../../containers/knowledge/KnowledgeForm';
import KnowledgeRow from './KnowledgeRow';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

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
const KnowledgeList = (props: Props) => {
  const {
    topics,
    loading,
    remove,
    renderButton,
    currentCategoryId,
    queryParams,
    articlesCount,
    refetch,
  } = props;

  const renderSidebarHeader = () => {
    const trigger = (
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add Knowledge Base
      </Button>
    );

    const content = (props) => (
      <KnowledgeForm {...props} renderButton={renderButton} />
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
  };

  const renderTopics = () => {
    return (
      <>
        {topics.map((topic) => (
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
  };

  return (
    <Sidebar wide={true} header={renderSidebarHeader()} hasBorder={true}>
      <DataWithLoader
        data={renderTopics()}
        loading={loading}
        count={topics.length}
        emptyText="There is no knowledge base"
        emptyImage="/images/actions/18.svg"
      />
    </Sidebar>
  );
};

export default KnowledgeList;
