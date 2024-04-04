import React from 'react';
import { IQuiz, ICategory, ICompany, ITag } from '../../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import { quizState } from '../../constants';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import QuestionList from '../../containers/quiz/QuestionList';
import QuestionForm from '../../containers/quiz/QuestionForm';
import { MarginAuto } from '../../styles';

type Props = {
  quiz?: IQuiz;
  tags?: ITag[];
  companies: ICompany[];
  closeModal: () => void;
  categories: ICategory[];
  refetch: any;
  changeState: (state: string, _id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onDelete?: (_id: string) => void;
};

type State = {
  selectedTags: string[];
  state: string;
};

class QuizForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const quiz = props.quiz || ({} as IQuiz);

    this.state = {
      selectedTags: quiz.tagIds || [],
      state: quiz.state || 'DRAFT'
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    categoryId: string;
    companyId: string;
    description: string;
    state: string;
  }) => {
    const { quiz } = this.props;
    const finalValues = values;

    if (quiz) {
      finalValues._id = quiz._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      categoryId: finalValues.categoryId,
      companyId: finalValues.companyId,
      tagIds: this.state.selectedTags,
      description: finalValues.description,
      state: this.state.state
    };
  };

  renderOptions = (item, type: string) => {
    return (
      <>
        <option key="null" value="">
          No {type}
        </option>
        {item &&
          item.map(p => (
            <option key={p._id} value={p._id}>
              {type === 'category' ? p.name : p.primaryName}
            </option>
          ))}
      </>
    );
  };

  renderTagOptions = () => {
    return this.props.tags.map(tag => ({
      value: tag._id,
      label: tag.name,
      _id: tag._id
    }));
  };

  onChangeTag = tags => {
    const ids = tags.map(m => m._id);
    this.setState({ selectedTags: ids });
  };

  onStatusChange = e => {
    e.preventDefault();

    this.setState({ state: e.target.value });
    this.props.changeState(e.target.value, this.props.quiz._id);
  };

  renderQuestionForm = props => (
    <QuestionForm {...props} quizId={this.props.quiz._id} />
  );

  renderQuestionList = () => {
    const { quiz, onDelete } = this.props;

    if (quiz.questions?.length > 0) {
      return quiz.questions.map((q, i) => (
        <QuestionList key={q._id} _id={q._id} index={i} onDelete={onDelete} />
      ));
    }

    return 'No questions';
  };

  renderDetail = object => {
    if (object._id) {
      return (
        <>
          <FormGroup>
            <ControlLabel>{__('State')}</ControlLabel>
            <FormControl
              componentClass="select"
              name="state"
              onChange={e => this.onStatusChange(e)}
              value={this.state.state}
            >
              {quizState.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FlexContent>
            <FlexItem count={4}>
              <h3>Questions</h3>
            </FlexItem>
            <MarginAuto>
              <FlexItem count={1.05}>
                <ModalTrigger
                  trigger={
                    <Button btnStyle="success" icon="plus-circle">
                      Add Questions
                    </Button>
                  }
                  content={this.renderQuestionForm}
                  title="Add Qustions"
                />
              </FlexItem>
            </MarginAuto>
          </FlexContent>
          {this.renderQuestionList()}
        </>
      );
    }

    return null;
  };

  renderContent = (formProps: IFormProps) => {
    const { quiz, renderButton, closeModal } = this.props;

    const { isSubmitted, values } = formProps;

    const object = quiz || ({} as IQuiz);

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl {...formProps} name="name" defaultValue={object.name} />
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
          <ControlLabel required={true}>Choose the category</ControlLabel>
          <FormControl
            {...formProps}
            name="categoryId"
            componentClass="select"
            defaultValue={object.category?._id || ''}
          >
            {this.renderOptions(this.props.categories, 'category')}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose company</ControlLabel>

          <FormControl
            {...formProps}
            name="companyId"
            componentClass="select"
            defaultValue={object.company?._id || ''}
          >
            {this.renderOptions(this.props.companies, 'company')}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Tags')}</ControlLabel>
          <Select
            placeholder={__('Choose tags')}
            options={this.renderTagOptions()}
            value={this.state.selectedTags}
            onChange={this.onChangeTag}
            multi={true}
          />
        </FormGroup>

        {this.renderDetail(object)}

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
            passedName: 'quiz',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: Object.keys(quiz).length > 0 && quiz
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default QuizForm;
