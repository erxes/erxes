import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { NotWrappable } from 'modules/settings/permissions/styles';
import React from 'react';
import SkillTypes from '../containers/SkillTypes';
import { ISkillDocument, ISkillTypesDocument } from '../types';
import SkillForm from './SkillForm';
import SkillRow from './SkillRow';

const breadcrumb = [
  { title: 'Settings', link: '/settings' },
  { title: __('Skill types') }
];

type Props = {
  history: any;
  queryParams: any;
  currentTypeName: string;
  totalCount: number;
  isLoading: boolean;
  remove: (id: string) => void;
  refetchQueries: any;
  skills: ISkillDocument[];
  skillTypes: ISkillTypesDocument[];
};

function Skills(props: Props) {
  const {
    queryParams,
    totalCount,
    isLoading,
    skills,
    skillTypes,
    currentTypeName,
    remove,
    refetchQueries
  } = props;

  const renderForm = formProps => {
    return (
      <SkillForm
        {...formProps}
        skillTypes={skillTypes}
        refetchQueries={refetchQueries}
      />
    );
  };

  function renderActionBar() {
    const trigger = (
      <Button
        id="skill-new-skill"
        btnStyle="primary"
        icon="plus-circle"
        uppercase={false}
      >
        {__('New skill')}
      </Button>
    );

    const title = <Title>{currentTypeName || __('All Skills')}</Title>;

    const actionBarRight = (
      <NotWrappable>
        <ModalTrigger
          title="New Skill"
          trigger={trigger}
          content={renderForm}
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

  function renderObjects() {
    return skills.map(skill => {
      return (
        <SkillRow
          key={skill._id}
          removeItem={remove}
          skill={skill}
          skillTypes={skillTypes}
          refetchQueries={refetchQueries}
        />
      );
    });
  }

  function renderData() {
    return (
      <Table whiteSpace="nowrap" hover={true} bordered={true}>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Type')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{renderObjects()}</tbody>
      </Table>
    );
  }

  function renderContent() {
    return (
      <DataWithLoader
        data={renderData()}
        loading={isLoading}
        count={totalCount}
        emptyText={__('There are no skills in this type')}
        emptyImage="/images/actions/11.svg"
      />
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Skill types')} breadcrumb={breadcrumb} />
      }
      actionBar={renderActionBar()}
      leftSidebar={<SkillTypes queryParams={queryParams} />}
      content={renderContent()}
      footer={<Pagination count={totalCount} />}
    />
  );
}

export default Skills;
