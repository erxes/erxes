import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, ModalTrigger, DataWithLoader } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { KnowledgeForm } from '../../containers';
import { HelperButtons } from 'modules/layout/styles';
import { KnowledgeRow } from './';

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
    const { __ } = this.context;

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
        <ModalTrigger title="Add Knowledge base" trigger={trigger}>
          {this.renderForm({ save })}
        </ModalTrigger>
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

KnowledgeList.propTypes = propTypes;
KnowledgeList.contextTypes = contextTypes;

export default KnowledgeList;
