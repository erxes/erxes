import { Actions, HeaderContent, TemplateBox } from './styles';
import {
  Content,
  FlexWrap,
  PreviewContent,
  SiteBox,
  SitePreview
} from '../sites/styles';
import { __, getEnv } from '@erxes/ui/src/utils/core';

import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ITemplateDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import { Title } from '@erxes/ui/src/styles/main';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  templates: ITemplateDoc[];
  templatesCount: number;
  // setCount: (count: number) => void;
  use: (_id: string, name: string) => void;
};

function List(props: Props) {
  const { templates, templatesCount, use } = props;

  const renderDemoAction = (template: ITemplateDoc) => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:webbuilder/demo/${template._id}`;

    const onClick = () => window.open(`${url}`, '_blank');

    return (
      <div onClick={onClick}>
        <Icon icon="eye" /> Show demo
      </div>
    );
  };

  const renderR = (template: ITemplateDoc, index: number) => {
    return (
      <SiteBox key={index}>
        <h5>{template.name}</h5>
        <TemplateBox>
          <Actions>
            <div onClick={() => use(template._id, template.name)}>
              <Icon icon="play" /> Use
            </div>

            {renderDemoAction(template)}
          </Actions>
          {/* <IframePreview>
            <iframe title="content-iframe" srcDoc={template.html} />
          </IframePreview> */}
        </TemplateBox>
      </SiteBox>
    );
  };

  const renderRow = (template: ITemplateDoc, index: number) => {
    return (
      <SiteBox key={index}>
        <SitePreview>
          <img
            src="https://templatemo.com/thumbnails-360/tm-557-grad-school.jpg"
            alt="site-img"
          />
          <PreviewContent>
            <Button btnStyle="white" onClick={() => this.showSite(template)}>
              View site
            </Button>
          </PreviewContent>
        </SitePreview>
        <Content>
          <div>
            <b>{template.name}</b>
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
            <FlexWrap>
              {templates.map((template, index) => renderRow(template, index))}
            </FlexWrap>
          }
          count={5}
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
