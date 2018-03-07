import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  ModalTrigger,
  EmptyState,
  Spinner
} from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { KnowledgeForm } from '../../containers';
import { KnowledgeRow } from './';
import { RightButton } from '../../styles';

const propTypes = {
  queryParams: PropTypes.object,
  currentCategoryId: PropTypes.string,
  save: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  count: PropTypes.number,
  loading: PropTypes.bool.isRequired,
  topics: PropTypes.array,
  articlesCount: PropTypes.number.isRequired,
  topicsCount: PropTypes.number.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class KnowledgeList extends Component {
  constructor(props) {
    super(props);

    this.renderSidebarList = this.renderSidebarList.bind(this);
  }

  renderForm(props) {
    return <KnowledgeForm {...props} />;
  }

  renderSidebarList() {
    const {
      topics,
      remove,
      save,
      currentCategoryId,
      queryParams,
      articlesCount
    } = this.props;

    return (
      <div>
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
      </div>
    );
  }

  renderSidebarHeader() {
    const { Header } = Sidebar;
    const { save } = this.props;
    const { __ } = this.context;

    const trigger = (
      <RightButton>
        <Icon icon="plus" />
      </RightButton>
    );

    return (
      <Header bold uppercase>
        {__('Knowledge base')}
        <ModalTrigger title="Add Knowledge base" trigger={trigger}>
          {this.renderForm({ save })}
        </ModalTrigger>
      </Header>
    );
  }

  showEmptyState() {
    const { topicsCount, loading } = this.props;

    return (
      !loading &&
      topicsCount === 0 && (
        <EmptyState
          image="/images/robots/robot-03.svg"
          text="Add knowledge base."
        />
      )
    );
  }

  render() {
    const { loading } = this.props;

    return (
      <Sidebar wide header={this.renderSidebarHeader()}>
        <Sidebar.Section noBackground noShadow full>
          {this.renderSidebarList()}
          {loading && <Spinner />}
          {this.showEmptyState()}
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

KnowledgeList.propTypes = propTypes;
KnowledgeList.contextTypes = contextTypes;

export default KnowledgeList;
