import { DataWithLoader, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { HelperButtons } from 'modules/layout/styles';
import React, { Component, Fragment } from 'react';
import { KnowledgeForm } from '../../containers';
import { ITopic } from '../../types';
import { KnowledgeRow } from './';

type Props = {
  queryParams: any;
  currentCategoryId: string;

  // TODO: replace any
  save: ({ doc }: { doc: any }, callback: () => void, object: any) => void;

  remove: ( _id: string ) => void;
  count?: number;
  loading: boolean;
  topics: ITopic[];
  articlesCount: number;
  topicsCount: number;
};

class KnowledgeList extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.renderSidebarList = this.renderSidebarList.bind(this);
  }

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
      <Fragment>
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
      </Fragment>
    );
  }

  renderSidebarList() {
    const { loading, topicsCount } = this.props;

    return (
      <DataWithLoader
        loading={loading}
        count={topicsCount}
        data={this.renderTopics()}
        emptyText="Add knowledge base."
        emptyImage="/images/robots/robot-03.svg"
        size="small"
      />
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
          content={(props) => <KnowledgeForm {...props} save={save} />}
        />
      </Header>
    );
  }

  render() {
    return (
      <Sidebar full wide header={this.renderSidebarHeader()}>
        {this.renderSidebarList()}
      </Sidebar>
    );
  }
}

export default KnowledgeList;
