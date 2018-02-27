import React, { Component } from 'react';
import { Wrapper } from 'modules/layout/components';
import { Button } from 'modules/common/components';

class Lead extends Component {
  render() {
    const actionBarRight = (
      <Button btnStyle="success" size="small" icon="plus">
        Create lead flow
      </Button>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Lead' }]} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        content={<div>hi</div>}
      />
    );
  }
}

export default Lead;
