import { HeaderContent } from './styles';
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
import { __, getEnv, router } from '@erxes/ui/src/utils/core';

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
import Uploader from '@erxes/ui/src/components/Uploader';
import { IAttachment } from '@erxes/ui/src/types';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  templates: ITemplateDoc[];
  templatesCount: number;
  use: (_id: string, name: string, coverImage: any) => void;
  queryParams: any;
} & IRouterProps;

function List(props: Props) {
  let timer;

  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState<IAttachment | undefined>(
    undefined
  );
  const [category, setCategory] = useState('');

  const { templates, templatesCount, use, queryParams } = props;

  const [search, setSearch] = useState(queryParams.searchValue);

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

  const filterTemplates = () => {
    if (!category) {
      return templates;
    }

    return templates.filter(template =>
      (template.categories || '').includes(category)
    );
  };

  const onClickCategory = (value: any) => {
    setCategory(value);
  };

  const onChangeCoverImage = (attachment: IAttachment[]) => {
    if (attachment.length) {
      setCoverImage(attachment[0]);

      return;
    }

    setCoverImage(undefined);
  };

  const renderCategories = (cat: any, index: number) => {
    return (
      <Tag
        key={index}
        isActive={category === cat.value}
        onClick={() => onClickCategory(cat.value)}
      >
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

        <FormGroup>
          <ControlLabel>Cover image</ControlLabel>

          <Uploader
            defaultFileList={coverImage ? [coverImage] : []}
            onChange={onChangeCoverImage}
            single={true}
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
            onClick={() => use(template._id, name, coverImage)}
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
            {template.name !== 'Blank' && renderDemoAction(template)}
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

  const onSearchTemplate = (e: any) => {
    if (timer) {
      clearTimeout(timer);
    }

    const { history } = props;

    const value = e.target.value;

    setSearch(value);

    timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue: value });
    }, 500);
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__('Search templates')}
        autoFocus={true}
        onChange={onSearchTemplate}
        defaultValue={search}
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
                  <Tag
                    isActive={!category}
                    onClick={() => onClickCategory(null)}
                  >
                    <Icon icon="menu-2" />
                    &nbsp; {__('All')}
                  </Tag>
                  {CATEGORIES.map((cat, index) => renderCategories(cat, index))}
                </Labels>
              </FilterContainer>
              <FlexWrap noPadding={true}>
                {filterTemplates().map((template, index) =>
                  renderRow(template, index)
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

export default withRouter<Props>(List);
