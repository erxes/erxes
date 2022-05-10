import { FormControl } from '@erxes/ui/src/components/form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Table from '@erxes/ui/src/components/table';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { __, router } from 'coreui/utils';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import { FilterContainer } from '@erxes/ui-settings/src/styles';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import List from '@erxes/ui-settings/src/common/components/List';
import RowActions from '@erxes/ui-settings/src/common/components/RowActions';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import Form from '@erxes/ui-settings/src/responseTemplates/components/Form';
import CategoryList from '@erxes/ui-settings/src/templates/containers/productCategory/CategoryList';
import {
  RESPONSE_TEMPLATE_STATUSES,
  RESPONSE_TEMPLATE_TIPTEXT
} from '../constants';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';

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
        <Tip text={__(text)} placement="top">
          <Icon icon={icon} />
        </Tip>
      </Button>
    );
  };

  renderRows = ({ objects }) => {
    return objects.map((object, index) => {
      const brand = object.brand || {};

      return (
        <tr key={index}>
          <td>{brand.name}</td>
          <td>{object.name}</td>
          <RowActions
            {...this.props}
            object={object}
            size="lg"
            renderForm={this.renderForm}
            additionalActions={this.renderDisableAction}
          />
        </tr>
      );
    });
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
    const brandId =
      this.props.queryParams && this.props.queryParams.brandId
        ? this.props.queryParams
        : '';

    return (
      <FilterContainer>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Search</ControlLabel>
            <FormControl
              placeholder={__('Search')}
              name="searchValue"
              onChange={this.onChange}
              value={this.state.searchValue}
              onKeyPress={this.handleKeyDown}
              autoFocus={true}
            />
          </FlexItem>

          <FlexItem>
            <ControlLabel>Brand</ControlLabel>
            <SelectBrands
              label="Brand"
              initialValue={brandId}
              onSelect={this.onSelect}
              name="brandId"
              multi={false}
            />
          </FlexItem>
        </FlexRow>
      </FilterContainer>
    );
  };

  renderContent = props => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Brand')}</th>
            <th>{__('Name')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(props)}</tbody>
      </Table>
    );
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
        renderFilter={this.renderFilter}
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        size="lg"
        {...this.props}
        center={true}
      />
    );
  }
}

export default withRouter<FinalProps>(ResponseTemplateList);
