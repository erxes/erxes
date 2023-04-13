import {
  CustomRangeContainer,
  FilterWrapper,
  LeftActionbar,
  RightMenuContainer
} from '../styles';

import { BarItems } from '@erxes/ui/src/layout';
import BreadCrumb from '@erxes/ui/src/components/breadcrumb/BreadCrumb';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FileFormContainer from '../containers/file/FileForm';
import FileList from '../containers/file/FileList';
import FolderForm from '../containers/folder/FolderForm';
import FolderList from '../containers/folder/FolderList';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IFolder } from '../types';
import { IOption } from '@erxes/ui/src/types';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import RTG from 'react-transition-group';
import React from 'react';
import Select from 'react-select-plus';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import ShareForm from '../containers/ShareForm';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';

type Props = {
  queryParams: any;
  currentFolder: IFolder;
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
};

type State = {
  showFilter: boolean;
};

class FileManager extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      showFilter: false
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showFilter: false });
    }
  };

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || '');
    }
  };

  onChangeRangeFilter = (kind: string, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';

    const { queryParams, onSelect } = this.props;

    if (queryParams[kind] !== formattedDate) {
      onSelect(formattedDate, kind);
    }
  };

  renderFilters = () => {
    const { queryParams, onSelect } = this.props;

    const types = queryParams ? queryParams.type : [];

    const onTypeSelect = (ops: IOption) =>
      onSelect(ops && ops.value ? ops.value : '', 'type');

    return (
      <FilterWrapper>
        <ControlLabel>By Name</ControlLabel>
        <FormControl
          type="text"
          defaultValue={queryParams.search}
          placeholder={__('Type to search ...')}
          onKeyPress={this.onSearch}
        />
        <ControlLabel>By created team member</ControlLabel>
        <SelectTeamMembers
          label="Filter by team members"
          name="contentTypeId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />
        <ControlLabel>By file type</ControlLabel>
        <Select
          placeholder={__('Filter by type')}
          value={types}
          options={[
            { value: 'simple', label: 'Simple file' },
            { value: 'dynamic', label: 'Dynamic file' }
          ]}
          isClearable={true}
          name="type"
          onChange={onTypeSelect}
          loadingPlaceholder={__('Loading...')}
        />
        <ControlLabel>By created date</ControlLabel>
        <CustomRangeContainer>
          <DateControl
            value={queryParams.createdAtFrom}
            required={false}
            name="createdAtFrom"
            onChange={date => this.onChangeRangeFilter('createdAtFrom', date)}
            placeholder={'Start date'}
            dateFormat={'YYYY-MM-DD'}
          />

          <DateControl
            value={queryParams.createdAtTo}
            required={false}
            name="createdAtTo"
            placeholder={'End date'}
            onChange={date => this.onChangeRangeFilter('createdAtTo', date)}
            dateFormat={'YYYY-MM-DD'}
          />
        </CustomRangeContainer>
      </FilterWrapper>
    );
  };

  render() {
    const { queryParams, currentFolder } = this.props;
    const { showFilter } = this.state;

    const breadcrumb = [
      { title: __('File Managers') },
      {
        title: __(`${currentFolder.name || ''} `)
      }
    ];

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add File
      </Button>
    );

    const folderTrigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Add Sub Folder
      </Button>
    );

    const shareTrigger = (
      <Button btnStyle="warning" icon="share-alt">
        Share folder
      </Button>
    );

    const shareContent = props => <ShareForm {...props} item={currentFolder} />;

    const content = props => (
      <FileFormContainer {...props} queryParams={queryParams} />
    );

    const folderContent = props => (
      <FolderForm {...props} queryParams={queryParams} />
    );

    const actionBarLeft = (
      <LeftActionbar>
        <BreadCrumb
          breadcrumbs={[
            {
              title: __(currentFolder.name)
            }
          ]}
        />
        {currentFolder.sharedUsers && currentFolder.sharedUsers.length !== 0 && (
          <Label lblStyle="success" ignoreTrans={true}>
            <>Shared {(currentFolder.sharedUsers || []).length} member</>
          </Label>
        )}
      </LeftActionbar>
    );

    const actionBarRight = (
      <div ref={this.setWrapperRef}>
        <BarItems>
          <ModalTrigger
            title="Share Folder"
            trigger={shareTrigger}
            content={shareContent}
            centered={true}
            enforceFocus={false}
          />

          <ModalTrigger
            title="Add Sub Folder"
            trigger={folderTrigger}
            content={folderContent}
            centered={true}
            enforceFocus={false}
          />

          <ModalTrigger
            title="Add File"
            trigger={trigger}
            hideHeader={true}
            content={content}
            centered={true}
            enforceFocus={false}
          />
          <Button
            btnStyle="simple"
            icon="bars"
            onClick={() => this.setState({ showFilter: !showFilter })}
          >
            {__('Show Filter')}
          </Button>
          <RTG.CSSTransition
            in={showFilter}
            timeout={300}
            classNames="slide-in-right"
            unmountOnExit={true}
          >
            <RightMenuContainer>{this.renderFilters()}</RightMenuContainer>
          </RTG.CSSTransition>
        </BarItems>
      </div>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('FileManager')} breadcrumb={breadcrumb} />
        }
        leftSidebar={<FolderList queryParams={queryParams} />}
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
        }
        content={
          <DataWithLoader
            data={
              queryParams._id ? <FileList queryParams={queryParams} /> : null
            }
            loading={false}
            count={100}
            emptyContent={
              <EmptyState
                image="/images/actions/5.svg"
                text="No folders at the moment!"
              />
            }
          />
        }
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default FileManager;
