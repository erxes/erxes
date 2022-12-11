import { Actions, HeaderContent, TemplateBox } from './styles';
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
import { ModalFooter, Title } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import { __, getEnv } from '@erxes/ui/src/utils/core';

import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import { CATEGORIES } from '../../constants';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ITemplateDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  templates: ITemplateDoc[];
  templatesCount: number;
  use: (_id: string, name: string) => void;
};

function List(props: Props) {
  const [name, setName] = useState('');

  const { templates, templatesCount, use } = props;

  const renderDemoAction = (template: ITemplateDoc) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:webbuilder/demo/${template._id}`;

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

    const content = ({ closeModal }) => (
      <>
        <FormGroup>
          <ControlLabel required={true}>Your WebSite Name</ControlLabel>

          <FormControl
            name="name"
            autoFocus={true}
            defaultValue={name}
            required={true}
            onChange={(e: any) => setName(e.target.value)}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            icon="plus-circle"
            onClick={() => use(template._id, name)}
            uppercase={false}
          >
            Create
          </Button>
        </ModalFooter>
      </>
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
            <span>Business</span>
          </div>
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
          title={__('Webbuilder Workspace')}
          breadcrumb={[
            { title: 'Webbuilder', link: '/webbuilder' },
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
                {templates.map((template, index) => renderRow(template, index))}
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
