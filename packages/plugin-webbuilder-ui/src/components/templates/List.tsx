import {
  Content,
  FilterContainer,
  FlexWrap,
  Labels,
  PreviewContent,
  SiteBox,
  SitePreview,
  Tag
} from '../sites/styles';
import { __, getEnv } from '@erxes/ui/src/utils/core';

import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import { CATEGORIES } from '../../constants';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import { HeaderContent } from './styles';
import { ITemplateDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Label } from '@erxes/ui/src/components/form/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import TemplateForm from '../../containers/templates/TemplateForm';
import { Title } from '@erxes/ui/src/styles/main';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  templates: ITemplateDoc[];
  templatesCount: number;
};

function List(props: Props) {
  const { templates, templatesCount } = props;

  const renderDemoAction = (template: ITemplateDoc) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:xbuilder/demo/${template._id}`;

    const onClick = () => window.open(`${url}`, '_blank');

    return (
      <Button btnStyle="white" onClick={onClick}>
        Preview
      </Button>
    );
  };

  const renderCategories = (cat: any, index: number) => {
    return (
      <Tag key={index}>
        {cat.icon} &nbsp;
        {cat.label}
      </Tag>
    );
  };

  const renderUseAction = template => {
    const trigger = <Button btnStyle="white">{__('Use')}</Button>;
    const site = localStorage.getItem('xbuilderSiteId') || '';

    const content = ({ closeModal }) => (
      <TemplateForm
        closeModal={closeModal}
        currentTemplateId={template._id}
        selectedSite={site}
      />
    );

    return (
      <ModalTrigger
        title="Name your site"
        trigger={trigger}
        content={content}
      />
    );
  };

  const renderRow = (template: ITemplateDoc, index: number) => {
    return (
      <SiteBox key={index}>
        <SitePreview>
          <img src={template.image} alt="template-img" />
          <PreviewContent>
            {renderDemoAction(template)}
            {renderUseAction(template)}
          </PreviewContent>
        </SitePreview>
        <Content>
          <div>
            <b>{template.name}</b>
            <span>{__('Business')}</span>
          </div>
          <Label>{__('Free')}</Label>
        </Content>
      </SiteBox>
    );
  };

  const actionBarLeft = (
    <HeaderContent>
      <Title>{__('Create new site')}</Title>
      <p>
        {__('You can easily customize any of our Portfolio website templates')}
      </p>
    </HeaderContent>
  );

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Search templates')}
        autoFocus={true}
      />
    </BarItems>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('X Builder Workspace')}
          breadcrumb={[
            { title: 'X Builder', link: '/xbuilder' },
            { title: __('New website') }
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
      }
      content={
        <DataWithLoader
          data={
            <>
              <FilterContainer>
                <Labels>
                  <Tag isActive={true}>
                    <Icon icon="menu-2" />
                    &nbsp; {__('All')}
                  </Tag>
                  {CATEGORIES.map((cat, index) => renderCategories(cat, index))}
                </Labels>
              </FilterContainer>
              <FlexWrap noPadding={true}>
                {renderRow(
                  {
                    _id: '0',
                    name: 'Blank Site',
                    html: '',
                    image: '/images/previews/blank.png'
                  },
                  0
                )}
                {templates.map((template, index) =>
                  renderRow(template, index + 1)
                )}
              </FlexWrap>
            </>
          }
          count={templates.length || templatesCount}
          loading={false}
          emptyText="No templates"
          emptyImage="/images/actions/8.svg"
        />
      }
      footer={<Pagination count={templatesCount} />}
      hasBorder={true}
    />
  );
}

export default List;
