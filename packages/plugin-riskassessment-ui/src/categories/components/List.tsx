import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import {
  Box,
  Button,
  confirm,
  ControlLabel,
  DataWithLoader,
  DateControl,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  router,
  Sidebar,
  SidebarList,
  Spinner,
  Tip,
  Wrapper,
  __
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { commonRefetchType } from '../../common/types';
import { subOption } from '../../common/utils';
import { Padding, FormContainer as Container } from '../../styles';
import FormContainer from '../container/Form';

type Props = {
  queryParams?: any;
  categories?: any;
  totalCount: number;
  loading: boolean;
  removeCategory: (id: string) => any;
  refetch: (prop?: commonRefetchType) => any;
  riskAssessmentsRefetch?: (props: commonRefetchType) => any;
} & IRouterProps;

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  field: any;
  clearable?: boolean;
  type?: string;
}

type State = {
  searchValue: string;
  isEnabledSearch: boolean;
  perPage: number;
  sortDirection: number;
  from: string;
  to: string;
};

const generateQueryParamsDate = params => {
  return params ? new Date(parseInt(params)).toString() : '';
};

const { Section } = Wrapper.Sidebar;
class AssessmentCategories extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { from, to } = props.queryParams;

    this.state = {
      searchValue: '',
      isEnabledSearch: false,
      perPage: 20,
      sortDirection: -1,
      from: generateQueryParamsDate(from),
      to: generateQueryParamsDate(to)
    };
  }

  addModal = () => {
    const trigger = (
      <Button block btnStyle="success">
        Add New Assessment Category
      </Button>
    );

    const content = ({ closeModal }) => {
      return (
        <FormContainer refetch={this.props.refetch} closeModal={closeModal} />
      );
    };

    return (
      <ModalTrigger
        isAnimate
        title="Add New Indicators Category"
        content={content}
        trigger={trigger}
      />
    );
  };

  removeQueryParams = () => {
    router.removeParams(this.props.history, 'categoryId');
  };

  handleSearch = e => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ searchValue: value });

    this.props.refetch({ searchValue: value, perPage: this.state.perPage });
  };

  rightActionBar = (<Padding>{this.addModal()}</Padding>);

  renderContent() {
    const { categories, queryParams } = this.props;

    return categories.map(category => (
      <SidebarListItem
        key={category._id}
        isActive={queryParams.categoryId === category._id}
      >
        <Link to={`?categoryId=${category._id}`}>
          {category.parentId && subOption(category)}
          {category.name}
        </Link>
        <ActionButtons>
          {this.renderCategoryEditAction(category)}
          {this.renderCategoryRemoveAction(category._id)}
        </ActionButtons>
      </SidebarListItem>
    ));
  }

  renderCategoryEditAction(category) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = ({ closeModal }) => {
      return (
        <FormContainer
          trigger={trigger}
          categoryId={category._id}
          formId={category.formId}
          closeModal={closeModal}
        />
      );
    };

    return (
      <ModalTrigger
        isAnimate
        title="Edit Assessment Category"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderCategoryRemoveAction(id: string) {
    const remove = () => {
      confirm().then(() => {
        this.props.removeCategory(id);
      });
    };

    return (
      <Button btnStyle="link" onClick={remove}>
        <Tip text="Remove" placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderCategoryList() {
    const { loading, totalCount } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no risk asssessment category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  renderCategories() {
    const { isEnabledSearch } = this.state;

    const extraButtons = (
      <>
        {this.props.queryParams.categoryId && (
          <Button btnStyle="link" onClick={this.removeQueryParams}>
            <Tip text="Clear Filter">
              <Icon icon="cancel-1" />
            </Tip>
          </Button>
        )}
        <Button
          btnStyle="link"
          icon="search"
          onClick={() =>
            this.setState(prev => ({
              ...prev,
              isEnabledSearch: !prev.isEnabledSearch
            }))
          }
        />
      </>
    );

    return (
      <Box
        name="categories"
        title={__('Categories')}
        extraButtons={extraButtons}
      >
        {isEnabledSearch && (
          <Padding horizontal>
            <FormControl
              type="text"
              placeholder="type a search"
              value={this.state.searchValue}
              onChange={this.handleSearch}
            />
          </Padding>
        )}
        {this.renderCategoryList()}
      </Box>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true}>
        <Section
          maxHeight={500}
          collapsible={this.props.totalCount > 9}
          noMargin
          noShadow
        >
          {this.rightActionBar}
          {this.renderCategories()}
        </Section>
      </Sidebar>
    );
  }
}
export default AssessmentCategories;
