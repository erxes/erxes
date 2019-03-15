import { Button, Calendar } from 'modules/common/components';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { DealColumn } from '../../containers';

type Props = {
  history: any;
  queryParams: any;
};

class CalendarView extends React.Component<Props> {
  renderActionBar() {
    const actionBarRight = (
      <BarItems>
        <Link to="/deals/board">
          <Button btnStyle="success">{__('Board')}</Button>
        </Link>
      </BarItems>
    );

    return (
      <Wrapper.ActionBar right={actionBarRight} background="transparent" />
    );
  }

  renderContent() {
    return <Calendar renderColumn={this.renderColumn} />;
  }

  renderColumn = (date: IDateColumn) => {
    return <DealColumn date={date} />;
  };

  render() {
    const breadcrumb = [{ title: __('Deal') }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar()}
        content={this.renderContent()}
        transparent={true}
      />
    );
  }
}

export default CalendarView;
