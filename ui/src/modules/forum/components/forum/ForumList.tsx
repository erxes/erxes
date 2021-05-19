import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';

import { TopHeader } from 'modules/common/styles/main';
import React from 'react';

class ForumList extends React.Component {
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

    const content = props => <h1>form baina</h1>;

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
    return {
      /* <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={this.renderTopics()}
          loading={false}
          count={1}
          emptyText="There is no knowledge base"
          emptyImage="/images/actions/18.svg"
        />
      </Sidebar> */
    };
  }
}

export default ForumList;
