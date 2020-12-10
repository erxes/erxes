import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { NotWrappable } from 'modules/settings/permissions/styles';
import React from 'react';
import SkillTypes from '../containers/SkillTypes';
import { ISkillTypesDocument } from '../types';

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Skill types') }
];

type Props = {
  history: any;
  queryParams: any;
  skillTypes: ISkillTypesDocument[];
};

function Skills(props: Props) {
  const { queryParams } = props;

  function renderActionBar() {
    const trigger = (
      <Button
        id="new-skill-type"
        btnStyle="primary"
        icon="plus-circle"
        uppercase={false}
      >
        {__('New skill type')}
      </Button>
    );

    // TODO - currentSkillType
    const title = <Title>{__('All skill types')}</Title>;

    const actionBarRight = (
      <NotWrappable>
        <ModalTrigger
          title="New skill type"
          size="lg"
          trigger={trigger}
          content={props => <div />}
        />
      </NotWrappable>
    );

    return (
      <Wrapper.ActionBar
        left={title}
        right={actionBarRight}
        background="colorWhite"
      />
    );
  }

  function renderContent() {
    // TODO - skills total, paginate
    return null;
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Skill types')} breadcrumb={breadcrumb} />
      }
      actionBar={renderActionBar()}
      leftSidebar={<SkillTypes queryParams={queryParams} />}
      content={renderContent()}
    />
  );
}

export default Skills;
