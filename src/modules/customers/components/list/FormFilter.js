import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { DataWithLoader } from 'modules/common/components';
import { router } from 'modules/common/utils';

const propTypes = {
  history: PropTypes.object,
  counts: PropTypes.object.isRequired,
  forms: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

function Forms({ history, counts, forms, loading }, { __ }) {
  const { Section, Header } = Wrapper.Sidebar;

  const data = (
    <SidebarList>
      {forms.map(form => (
        <li key={form._id}>
          <a
            tabIndex={0}
            className={
              router.getParam(history, 'form') === form._id ? 'active' : ''
            }
            onClick={() => {
              router.setParams(history, { form: form._id });
            }}
          >
            {form.title}
            <SidebarCounter>{counts[form._id]}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <Section collapsible={forms.length > 5}>
      <Header uppercase>{__('Filter by form')}</Header>

      <DataWithLoader
        data={data}
        loading={loading}
        count={forms.length}
        emptyText="No brands"
        emptyIcon="pie-graph"
        size="small"
        objective={true}
      />
    </Section>
  );
}

Forms.propTypes = propTypes;
Forms.contextTypes = {
  __: PropTypes.func
};

export default withRouter(Forms);
