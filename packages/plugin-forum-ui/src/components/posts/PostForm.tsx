import { readFile } from '@erxes/ui/src/utils';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { ICategory, IPollOption, IPost, ITag } from '../../types';
import { SelectTeamMembers } from '@erxes/ui/src';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { CustomRangeContainer } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import PollOptions from './PollOptions';
import React from 'react';
import Select from 'react-select-plus';
import Uploader from '@erxes/ui/src/components/Uploader';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';

type Props = {
  post?: IPost;
  tags?: ITag[];
  closeModal: () => void;
  categories: ICategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  content?: string;
  title?: string;
  categoryId: string;
  selectedTags: string[];
  pollOptions: any;
  multipleChoice: boolean;
  hasEndDate: boolean;
  endDate?: any;
  thumbnail: any;
  createdAt: string;
  selectedUser: string;
};

class PostForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const post = props.post || ({} as IPost);

    this.state = {
      content: post.content || '',
      title: post.title || '',
      categoryId: post.categoryId,
      selectedTags: post.tagIds || [],
      pollOptions: post.pollOptions || [],
      multipleChoice: post.isPollMultiChoice || false,
      hasEndDate: post.pollEndDate ? true : false,
      endDate: post.pollEndDate || null,
      createdAt: post.createdAt || new Date().toString(),
      thumbnail: post.thumbnail
        ? {
            name: post && post.thumbnailAlt ? post.thumbnailAlt : '',
            type: 'image',
            url: post.thumbnail
          }
        : ({} as IAttachment),
      selectedUser: post.createdById || ''
    };
  }

  generateDoc = (values: {
    _id?: string;
    title: string;
    categoryId?: string;
    description?: string;
    selectedUser?: string;
  }) => {
    const { post } = this.props;
    const finalValues = values;

    if (post) {
      finalValues._id = post._id;
    }

    const optionsCleaned = this.state.pollOptions.map(
      ({ _id, title, order }) => {
        const option = {
          _id,
          order,
          title
        };
        return option;
      }
    );

    return {
      _id: finalValues._id,
      title: finalValues.title,
      content: this.state.content,
      thumbnail: readFile(this.state.thumbnail.url) || '',
      categoryId: finalValues.categoryId,
      description: finalValues.description,
      tagIds: this.state.selectedTags,
      pollEndDate: this.state.endDate,
      isPollMultiChoice: this.state.multipleChoice,
      pollOptions: optionsCleaned,
      createdAt: this.state.createdAt,
      createdById: this.state.selectedUser
    };
  };

  onChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  renderOptions = () => {
    const { categories } = this.props;

    return (
      <>
        <option key="null" value="">
          No category
        </option>
        {categories &&
          categories.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
      </>
    );
  };

  onChangeRangeFilter = (date, key: string) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
    this.setState({ ...this.state, [key]: formattedDate });
  };

  onChangeThumbnail = attachment => {
    return this.setState({
      thumbnail:
        attachment && attachment.length !== 0
          ? attachment[0]
          : ({} as IAttachment)
    });
  };

  renderContent = (formProps: IFormProps) => {
    const { post, renderButton, closeModal, tags } = this.props;
    const {
      content,
      categoryId,
      selectedTags,
      pollOptions,
      multipleChoice,
      hasEndDate
    } = this.state;

    const { isSubmitted, values } = formProps;

    const object = post || ({} as IPost);

    const renderTagOptions = () => {
      return (tags || []).map(tag => ({
        value: tag._id,
        label: tag.name,
        _id: tag._id
      }));
    };

    const onChange = members => {
      const ids = members.map(m => m._id);
      this.setState({ selectedTags: ids });
    };

    const changeOption = (ops: IPollOption[]) => {
      this.setState({ pollOptions: ops });
    };

    const onUserChange = memberId => {
      this.setState({ selectedUser: memberId });
    };

    const thumbnail =
      Object.keys(this.state.thumbnail).length === 0
        ? []
        : [this.state.thumbnail];

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <FlexContent>
            <FlexItem>
              <ControlLabel>{__('Thumbnail')}</ControlLabel>
              <Uploader
                defaultFileList={thumbnail}
                onChange={this.onChangeThumbnail}
                single={true}
              />
            </FlexItem>
            <FlexItem>
              <CustomRangeContainer>
                <ControlLabel>{__('Created At')}</ControlLabel>
                <DateControl
                  value={this.state.createdAt}
                  required={false}
                  name="createdAt"
                  onChange={date => this.onChangeRangeFilter(date, 'createdAt')}
                  placeholder={'End date'}
                  dateFormat={'YYYY-MM-DD'}
                />
              </CustomRangeContainer>
            </FlexItem>
          </FlexContent>
        </FormGroup>

        <FormGroup>
          <FlexContent>
            <FlexItem>
              <ControlLabel required={true}>Choose the category</ControlLabel>
              <FormControl
                {...formProps}
                name="categoryId"
                componentClass="select"
                defaultValue={categoryId}
              >
                {this.renderOptions()}
              </FormControl>
            </FlexItem>
            <FlexItem>
              <CustomRangeContainer>
                <ControlLabel>Choose publisher</ControlLabel>

                <SelectTeamMembers
                  label="Choose publisher"
                  name="selectedUser"
                  multi={false}
                  initialValue={this.state.selectedUser}
                  onSelect={e => onUserChange(e)}
                />
              </CustomRangeContainer>
            </FlexItem>
          </FlexContent>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Tags')}</ControlLabel>
          <Select
            placeholder={__('Choose tags')}
            options={renderTagOptions()}
            value={selectedTags}
            onChange={onChange}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Poll</ControlLabel>
          <FlexContent>
            <FlexItem>
              <FormGroup>
                <ControlLabel>Multiple choice</ControlLabel>
                <FormControl
                  {...formProps}
                  name="multipleChoice"
                  className="toggle-message"
                  componentClass="checkbox"
                  checked={multipleChoice}
                  onChange={() => {
                    this.setState({ multipleChoice: !multipleChoice });
                  }}
                />
              </FormGroup>
            </FlexItem>
            <FlexItem>
              <FormGroup>
                <ControlLabel>Has end date</ControlLabel>
                <FormControl
                  {...formProps}
                  name="hasEndDate"
                  className="toggle-message"
                  componentClass="checkbox"
                  checked={hasEndDate}
                  onChange={() => {
                    this.setState({ hasEndDate: !hasEndDate });
                  }}
                />
              </FormGroup>
            </FlexItem>
            {hasEndDate && (
              <FlexItem>
                <CustomRangeContainer>
                  <DateControl
                    value={this.state.endDate}
                    required={false}
                    name="endDate"
                    onChange={date => this.onChangeRangeFilter(date, 'endDate')}
                    placeholder={'End date'}
                    dateFormat={'YYYY-MM-DD'}
                  />
                </CustomRangeContainer>
              </FlexItem>
            )}
          </FlexContent>
          <PollOptions
            emptyMessage="There is no options"
            onChangeOption={options => changeOption(options || [])}
            options={pollOptions}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content || ''}
            onChange={this.onChange}
            isSubmitted={isSubmitted}
            height={300}
            name={`post_${post ? post._id : 'create'}`}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          {renderButton({
            passedName: 'post',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: post
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PostForm;
