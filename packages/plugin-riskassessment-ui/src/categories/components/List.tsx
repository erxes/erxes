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
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { statusColorConstant } from '../../common/constants';
import { commonRefetchType } from '../../common/types';
import { subOption } from '../../common/utils';
import {
  Box as StatusBox,
  ClearableBtn,
  ColorBox,
  FormContainer as Container,
  Padding
} from '../../styles';
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
  clearable?: boolean;
  type?: string;
}

type State = {
  searchValue: string;
  perPage: number;
  sortDirection: number;
  From: string;
  To: string;
};

const generateQueryParamsDate = params => {
  return params ? new Date(parseInt(params)).toString() : '';
};

const { Section } = Wrapper.Sidebar;
class AssessmentCategories extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { From, To } = props.queryParams;

    this.state = {
      searchValue: '',
      perPage: 20,
      sortDirection: -1,
      From: generateQueryParamsDate(From),
      To: generateQueryParamsDate(To)
    };
  }

  addModal = () => {
    const trigger = (
      <Button block btnStyle="success">
        Add New Assessment Category
      </Button>
    );

    const content = ({ closeModal }) => {
      return <FormContainer refetch={this.props.refetch} closeModal={closeModal} />;
    };

    return (
      <ModalTrigger
        isAnimate
        title="Add New Assessment Category"
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
      <SidebarListItem key={category._id} isActive={queryParams.categoryId === category._id}>
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
    return (
      <Box
        name="categories"
        title={__('Categories')}
        extraButtons={
          this.props.queryParams.categoryId && (
            <Button btnStyle="link" onClick={this.removeQueryParams}>
              <Tip text="Clear Filter">
                <Icon icon="cancel-1" />
              </Tip>
            </Button>
          )
        }
      >
        {this.renderCategoryList()}
      </Box>
    );
  }

  renderCategoriesFilter() {
    return (
      <Box name="filter_category" title={__('Addition Filter Categories')}>
        <Padding horizontal vertical>
          <FormGroup>
            <ControlLabel>Search</ControlLabel>
            <FormControl
              type="text"
              placeholder="type a search"
              value={this.state.searchValue}
              onChange={this.handleSearch}
            />
          </FormGroup>
        </Padding>
      </Box>
    );
  }

  renderListFilter() {
    const { From, To, sortDirection } = this.state;
    const { riskAssessmentsRefetch, history, queryParams } = this.props;

    const toggleSort = () => {
      this.setState({ sortDirection: sortDirection * -1 });
      riskAssessmentsRefetch && riskAssessmentsRefetch({ sortDirection: sortDirection * -1 });
    };

    const dateOrder = (value, name) => {
      router.setParams(history, { [name]: new Date(value).valueOf() });
    };
    const selectStatus = color => {
      router.setParams(history, { Status: color });
    };

    const CustomForm = ({ children, label, clearable }: LayoutProps) => {
      const handleClearable = () => {
        router.removeParams(history, label);
      };

      return (
        <FormGroup>
          <ControlLabel>{label}</ControlLabel>
          {clearable && (
            <ClearableBtn onClick={handleClearable}>
              <Tip text="Clear">
                <Icon icon="cancel-1" />
              </Tip>
            </ClearableBtn>
          )}
          {children}
        </FormGroup>
      );
    };

    return (
      <Box name="filter_list" title={__('Addition Filter List')}>
        <Padding horizontal vertical>
          <CustomForm label="Status" clearable={!!this.props.queryParams.Status}>
            <Container row>
              {statusColorConstant.map(status => (
                <StatusBox
                  selected={this.props.queryParams.Status === status.name}
                  onClick={() => selectStatus(status.name)}
                  key={status.color}
                >
                  <Container row gap align="center">
                    <ColorBox color={status.color} />
                  </Container>
                </StatusBox>
              ))}
            </Container>
          </CustomForm>
          <Container align="center" spaceBetween>
            <ControlLabel>Sort:</ControlLabel>
            <Button btnStyle="link" onClick={toggleSort}>
              <Tip text={`Sort by Created Date`} placement="bottom">
                <Icon size={15} icon="sort" />
              </Tip>
            </Button>
          </Container>
          <CustomForm label="From" clearable={queryParams.From}>
            <DateContainer>
              <DateControl
                name="from"
                value={From}
                placeholder="select from date "
                onChange={e => dateOrder(e, 'From')}
              />
            </DateContainer>
          </CustomForm>
          <CustomForm label="To" clearable={queryParams.To}>
            <DateContainer>
              <DateControl
                name="to"
                value={To}
                placeholder="select to date "
                onChange={e => dateOrder(e, 'To')}
              />
            </DateContainer>
          </CustomForm>
        </Padding>
      </Box>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true}>
        <Section maxHeight={500} collapsible={this.props.totalCount > 9} noMargin noShadow>
          {this.rightActionBar}
          {this.renderCategoriesFilter()}
          {this.renderCategories()}
          {this.renderListFilter()}
        </Section>
      </Sidebar>
    );
  }
}
export default AssessmentCategories;
