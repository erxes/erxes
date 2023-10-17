import * as React from 'react';

import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { EMPTY_CONTENT_SCRIPT } from '@erxes/ui-settings/src/constants';
import { __, router } from 'coreui/utils';
import { FilterContainer } from '@erxes/ui-settings/src/styles';
import Form from '../containers/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import Icon from '@erxes/ui/src/components/Icon';
import List from '@erxes/ui-settings/src/common/components/List';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import { withRouter } from 'react-router-dom';
import {
  Actions,
  IframePreview,
  Template,
  TemplateBox,
  TemplateInfo,
  Templates
} from '@erxes/ui-emailtemplates/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import InstallCode from './InstallCode';
import Tip from '@erxes/ui/src/components/Tip';
import { renderToString } from 'react-dom/server';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  changeStatus: (_id: string, status: string) => void;
  queryParams: any;
  history: any;
} & ICommonListProps;

type States = {
  searchValue: string;
};

type FinalProps = Props & IRouterProps;

class ScriptList extends React.Component<FinalProps, States> {
  constructor(props) {
    super(props);

    const { queryParams } = props;

    const searchValue =
      queryParams && queryParams.searchValue ? queryParams.searchValue : '';

    this.state = {
      searchValue
    };
  }

  onChange = (e: React.FormEvent) => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ searchValue: value });
  };

  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
  };

  renderEditAction = object => {
    const { save } = this.props;

    const content = props => {
      return this.renderForm({ ...props, object, save });
    };

    return (
      <ModalTrigger
        enforceFocus={false}
        title="Edit"
        size="lg"
        trigger={
          <div>
            <Icon icon="edit" /> Edit
          </div>
        }
        content={content}
      />
    );
  };

  installCodeAction = object => {
    const content = props => <InstallCode {...props} script={object} />;

    return (
      <ModalTrigger
        enforceFocus={false}
        title="Install code"
        size="lg"
        trigger={
          <div>
            <Icon icon="code" /> Install code
          </div>
        }
        content={content}
      />
    );
  };

  handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const { value, name } = e.currentTarget as HTMLInputElement;

      router.setParams(this.props.history, { [name]: value });
    }
  };

  onSelect = (values: string[] | string, name: string) => {
    router.setParams(this.props.history, { [name]: values });
  };

  renderFilter = () => {
    const scriptId =
      this.props.queryParams && this.props.queryParams.scriptId
        ? this.props.queryParams
        : '';

    return (
      <FilterContainer>
        <FlexRow>
          <FlexItem>
            <SelectBrands
              label="Script"
              initialValue={scriptId}
              onSelect={this.onSelect}
              name="scriptId"
              multi={false}
            />
          </FlexItem>

          <FlexItem>
            <FormControl
              placeholder={__('Search')}
              name="searchValue"
              onChange={this.onChange}
              value={this.state.searchValue}
              onKeyPress={this.handleKeyDown}
              onKeyDown={this.handleKeyDown}
              autoFocus={true}
            />
          </FlexItem>
        </FlexRow>
      </FilterContainer>
    );
  };

  removeTemplate = object => {
    this.props.remove(object._id);
  };

  renderBlock = () => {
    return this.props.objects.map((object, index) => {
      const contentHtml = renderToString(<InstallCode script={object} />);

      return (
        <Template key={index}>
          <h5>{object.name}</h5>
          <TemplateBox>
            <Actions>
              {this.renderEditAction(object)}
              <div onClick={this.removeTemplate.bind(this, object)}>
                <Icon icon="cancel-1" /> Delete
              </div>
              {this.installCodeAction(object)}
            </Actions>
            <IframePreview>
              <iframe title="scripts-iframe" srcDoc={contentHtml} />
            </IframePreview>
          </TemplateBox>
          <TemplateInfo>
            <div>
              {object.messenger && (
                <div>
                  <Tip text="Messenger" placement="top">
                    <Icon icon="comment-1" />
                  </Tip>{' '}
                  {object.messenger.name}
                </div>
              )}
              {object.kbTopic && (
                <div>
                  <Tip text="Knowledge Base" placement="top">
                    <Icon icon="book-open" />
                  </Tip>
                  {object.kbTopic.title}
                </div>
              )}
              {object.leads.length > 0 && (
                <div>
                  <Tip text="Forms" placement="top">
                    <Icon icon="window" />
                  </Tip>
                  {object.leads.map(lead => ` ${lead.name},`)}
                </div>
              )}
            </div>
          </TemplateInfo>
        </Template>
      );
    });
  };

  searchHandler = event => {
    const { history } = this.props;

    router.setParams(history, { page: 1, searchValue: event.target.value });
  };

  renderContent = () => {
    return <Templates>{this.renderBlock()}</Templates>;
  };

  render() {
    return (
      <List
        formTitle="New script"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Scripts') }
        ]}
        title={__('Scripts')}
        mainHead={
          <HeaderDescription
            icon="/images/actions/23.svg"
            title="Scripts"
            description={`${__(
              'Script manager allows erxes users to quickly and easily generate and update related scripts for any of their business websites'
            )}.${__(
              `Set up once and your team will be able to easily display multiple erxes widgets on any of their businesses websites`
            )}`}
          />
        }
        // flexFilter={this.renderFilter}
        // rightActionBar="true"
        emptyContent={<EmptyContent content={EMPTY_CONTENT_SCRIPT} />}
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        {...this.props}
        queryParams={this.props.queryParams}
        history={this.props.history}
        additionalButton={
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={this.searchHandler}
            value={router.getParam(this.props.history, 'searchValue')}
            autoFocus={true}
          />
        }
      />
    );
  }
}

export default withRouter<FinalProps>(ScriptList);
