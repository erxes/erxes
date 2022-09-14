import { BarItems, Button, FormControl, ModalTrigger, Table } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import _loadash from 'lodash';
import React from 'react';
import AssessmentCategories from '../categories/container/List';
import { ICommonListProps, RiskAssessmentsType } from '../common/types';
import { DefaultWrapper } from '../common/utils';
import Form from '../containers/Form';
import TableRow from './Row';

type Props = {
  queryParams: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  list: RiskAssessmentsType[];
  totalCount: number;
  refetch: ({ perPage, searchValue }: { perPage: number; searchValue: string }) => void;
} & ICommonListProps &
  IRouterProps;

type IState = {
  selectedValue: string[];
  perPage: number;
  searchValue: string;
};

class ListComp extends React.Component<Props, IState> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValue: [],
      perPage: 20,
      searchValue: ''
    };
    this.selectValue = this.selectValue.bind(this);
  }

  selectValue(id: string) {
    const { selectedValue } = this.state;
    if (selectedValue.includes(id)) {
      const newSelectedValue = selectedValue.filter(p => p !== id);
      return this.setState({ selectedValue: newSelectedValue });
    }
    this.setState({ selectedValue: [...selectedValue, id] });
  }

  selectAllValue(items) {
    if (
      _loadash.isEqual(
        items.map(object => object._id),
        this.state.selectedValue
      )
    ) {
      return this.setState({ selectedValue: [] });
    }
    const ids = items.map(item => item._id);
    this.setState({ selectedValue: ids });
  }

  renderForm = props => {
    return (
      <Form
        {...props}
        categoryId={this.props.queryParams.categoryId}
        renderButton={this.props.renderButton}
      />
    );
  };

  renderFormContent = props => {
    const save = this.props.save;
    return this.renderForm({ ...props, save });
  };

  rightActionBarTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add Risk Assessment
    </Button>
  );

  rightActionBar = (
    <ModalTrigger
      title="Add Risk Assessment"
      enforceFocus={false}
      trigger={this.rightActionBarTrigger}
      autoOpenKey="showListFormModal"
      content={this.renderFormContent}
      dialogClassName="transform"
      size="lg"
    />
  );
  handleRemoveBtn = () => {
    const { remove } = this.props;
    const { selectedValue } = this.state;
    remove(selectedValue);
    this.setState({ selectedValue: [] });
  };
  RemoveBtn = (
    <Button btnStyle="danger" icon="cancel-1" onClick={this.handleRemoveBtn}>
      Remove
    </Button>
  );

  handleSearch = e => {
    const { value } = e.currentTarget as HTMLInputElement;

    const { perPage, searchValue } = this.state;

    this.setState({ searchValue: value, selectedValue: [] });

    setTimeout(() => {
      this.props.refetch({ searchValue: value, perPage });
    }, 700);
  };

  renderSearchField = () => {
    return (
      <FormControl
        type="text"
        placeholder="type a search"
        onChange={this.handleSearch}
        value={this.state.searchValue}
      />
    );
  };

  renderContent = (list: RiskAssessmentsType[]) => {
    const { selectedValue } = this.state;
    return (
      <Table>
        <thead>
          <tr>
            <th>
              {list && (
                <FormControl
                  componentClass="checkbox"
                  checked={_loadash.isEqual(
                    selectedValue,
                    list.map(object => object._id)
                  )}
                  onChange={() => this.selectAllValue(list)}
                />
              )}
            </th>
            <th>Name</th>
            <th>Category Name</th>
            <th>Status</th>
            <th>Create At</th>
          </tr>
        </thead>
        <tbody>
          {list?.map((item, i) => {
            return (
              <TableRow
                key={i}
                object={item}
                selectedValue={selectedValue}
                onchange={this.selectValue}
                renderButton={this.props.renderButton}
              />
            );
          })}
        </tbody>
      </Table>
    );
  };

  render() {
    const { list, queryParams, refetch } = this.props;
    const { selectedValue } = this.state;

    const rightActionBar = (
      <BarItems>
        {<>{this.renderSearchField()}</>}
        {selectedValue.length > 0 && this.RemoveBtn}
        {this.rightActionBar}
      </BarItems>
    );

    const updatedProps = {
      ...this.props,
      title: 'Assessment List',
      rightActionBar: rightActionBar,
      content: this.renderContent(list),
      sidebar: (
        <AssessmentCategories
          {...this.props}
          riskAssessmentsRefetch={refetch}
          queryParams={queryParams}
        />
      )
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default ListComp;
