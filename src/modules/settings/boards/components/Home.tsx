import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Boards, Pipelines } from '../containers';

type Props = {
  boardId: string;
  type: string;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId, type } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Board') }
    ];

    switch (type) {
      case 'deal': {
        breadcrumb.push({ title: __('Deal'), link: '/settings/boards/deal' });

        break;
      }
      case 'ticket': {
        breadcrumb.push({
          title: __('Ticket'),
          link: '/settings/boards/ticket'
        });

        break;
      }
    }

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Board')} breadcrumb={breadcrumb} />}
        leftSidebar={<Boards type={type} currentBoardId={boardId} />}
        content={<Pipelines type={type} boardId={boardId} />}
      />
    );
  }
}

export default Home;
