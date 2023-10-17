import * as React from 'react';

import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import {
  RESPONSE_TEMPLATE_STATUSES,
  RESPONSE_TEMPLATE_TIPTEXT
} from '../constants';
import { __, router } from 'coreui/utils';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FilterContainer } from '@erxes/ui-settings/src/styles';
import Form from '@erxes/ui-inbox/src/settings/responseTemplates/components/Form';
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
  Templates,
  RowTitle
} from '@erxes/ui-emailtemplates/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

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

class ResponseTemplateList extends React.Component<FinalProps, States> {
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

  renderDisableAction = object => {
    const { changeStatus } = this.props;
    const _id = object._id;
    const isActive =
      object.status === null ||
      object.status === RESPONSE_TEMPLATE_STATUSES.ACTIVE;
    const icon = isActive ? 'archive-alt' : 'redo';

    const status = isActive
      ? RESPONSE_TEMPLATE_STATUSES.ARCHIVED
      : RESPONSE_TEMPLATE_STATUSES.ACTIVE;

    const text = isActive
      ? RESPONSE_TEMPLATE_TIPTEXT.ARCHIVED
      : RESPONSE_TEMPLATE_TIPTEXT.ACTIVE;

    if (!changeStatus) {
      return null;
    }

    const onClick = () => changeStatus(_id, status);

    return (
      <Button onClick={onClick} btnStyle="link">
        <Icon icon={icon} /> {text}
      </Button>
    );
  };

  handleKeyDown = (
    e: React.KeyboardEvent<Element> | React.MouseEvent<Element>
  ) => {
    if (
      e instanceof KeyboardEvent &&
      e.key !== 'Enter' &&
      e.key !== 'Backspace'
    ) {
      return;
    }

    const { value, name } = (e.currentTarget as any) as HTMLInputElement;
    router.setParams(this.props.history, { [name]: value });
  };

  onSelect = (values: string[] | string, name: string) => {
    router.setParams(this.props.history, { [name]: values });
  };

  renderFilter = () => {
    const brandId =
      this.props.queryParams && this.props.queryParams.brandId
        ? this.props.queryParams
        : '';

    return (
      <FilterContainer>
        <FlexRow>
          <FlexItem>
            <SelectBrands
              label="Brand"
              initialValue={brandId}
              onSelect={this.onSelect}
              name="brandId"
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
      return (
        <Template key={index} isLongName={object.name > 5}>
          <RowTitle>
            <div>
              <h5>{object.brand.name}</h5>
            </div>
            <div>
              <h5>{object.name}</h5>
            </div>
          </RowTitle>
          <TemplateBox>
            <Actions>
              {this.renderEditAction(object)}
              <div onClick={this.removeTemplate.bind(this, object)}>
                <Icon icon="cancel-1" /> Delete
              </div>
              {/* {this.renderDisableAction(object)} */}
            </Actions>
            <IframePreview>
              <iframe title="response-iframe" srcDoc={object.content} />
            </IframePreview>
          </TemplateBox>
        </Template>
      );
    });
  };

  renderContent = () => {
    return <Templates>{this.renderBlock()}</Templates>;
  };

  render() {
    return (
      <List
        formTitle="New response template"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Response templates') }
        ]}
        title={__('Response templates')}
        mainHead={
          <HeaderDescription
            icon="/images/actions/24.svg"
            title="Response templates"
            description={`${__(
              'Make things easy for your team members and add in ready made response templates'
            )}.${__(
              'Manage and edit your response templates according to each situation and respond in a timely manner and without the hassle'
            )}`}
          />
        }
        flexFilter={this.renderFilter}
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        size="lg"
        {...this.props}
        rightActionBar="true"
      />
    );
  }
}

export default withRouter<FinalProps>(ResponseTemplateList);
