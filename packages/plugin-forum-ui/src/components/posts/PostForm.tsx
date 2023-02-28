import React from 'react';
import { IPost, ICategory, IPollOption, ITag } from '../../types';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Button from '@erxes/ui/src/components/Button';
import Select from 'react-select-plus';
import PollOptions from './PollOptions';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import dayjs from 'dayjs';
import Uploader from '@erxes/ui/src/components/Uploader';
import { CustomRangeContainer } from '../../styles';

type Props = {
  post?: IPost;
  tags?: ITag[];
  closeModal: () => void;
  categories: ICategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  content: string;
  title: string;
  categoryId: string;
  selectedTags: string[];
  pollOptions: any;
  multipleChoice: boolean;
  hasEndDate: boolean;
  endDate: string;
  thumbnail: any;
  createdAt: string;
};

class PostForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const post = props.post || ({} as IPost);

    this.state = {
      content: post.content,
      title: post.title,
      categoryId: post.categoryId,
      selectedTags: post.tagIds || [],
      pollOptions: post.pollOptions || [],
      multipleChoice: post.isPollMultiChoice || false,
      hasEndDate: post.pollEndDate ? true : false,
      endDate: post.pollEndDate || null,
      createdAt: post.createdAt || new Date().toString(),
      thumbnail: {} as IAttachment
    };
  }

  generateDoc = (values: {
    _id?: string;
    title: string;
    categoryId?: string;
    description?: string;
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
      thumbnail: this.state.thumbnail.url || '',
      categoryId: finalValues.categoryId,
      description: finalValues.description,
      tagIds: this.state.selectedTags,
      pollEndDate: this.state.endDate,
      isPollMultiChoice: this.state.multipleChoice,
      pollOptions: optionsCleaned,
      createdAt: this.state.createdAt
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

  onChangeThumbnail = attachment => this.setState({ thumbnail: attachment });

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
      return tags.map(tag => ({
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
                defaultFileList={[]}
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
          <ControlLabel required={true}>Choose the category</ControlLabel>

          <FormControl
            {...formProps}
            name="categoryId"
            componentClass="select"
            defaultValue={categoryId}
          >
            {this.renderOptions()}
          </FormControl>
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
            onChangeOption={options => changeOption(options)}
            options={pollOptions}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <EditorCK
            content={content}
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
