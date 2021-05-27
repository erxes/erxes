import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Table from 'modules/common/components/table';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import SelectBrands from 'modules/settings/brands/containers/SelectBrands';
import { FlexItem, FlexRow } from 'modules/settings/styles';
import { FilterContainer } from 'modules/settings/team/styles';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import List from '../../common/components/List';
import RowActions from '../../common/components/RowActions';
import { ICommonListProps } from '../../common/types';
import Form from '../components/Form';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

    const {
      queryParams: { searchValue }
    } = props;

    this.state = {
      searchValue: searchValue || ''
    };
  }

  onChange = (e: React.FormEvent) => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ searchValue: value });
  };

  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
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
    const { brandId } = this.props.queryParams;

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
        leftActionBar={
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
        center={true}
        size="lg"
        {...this.props}
      />
    );
  }
}

export default withRouter<FinalProps>(ResponseTemplateList);
