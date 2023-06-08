import React from 'react';
import {
  BarItems,
  Box,
  Icon,
  ModalTrigger,
  Button,
  FormControl,
  __,
  confirm,
  FormGroup,
  ControlLabel,
  Tabs,
  TabTitle,
  Form as CommonForm
} from '@erxes/ui/src/';
import { IRCFA } from '../../../../plugin-rcfa-api/src/models/definitions/rcfa';
import {
  StyledContent,
  Divider,
  ListItem,
  ItemBtn,
  StyledListItem,
  TriggerTabs,
  TabAction
} from '../../styles';
import ResolverModal from './ResolverModal';
import _loadsh from 'lodash';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';

interface IRCFAIssues extends IRCFA {
  isEditing?: boolean;
  issue: string;
}

type Props = {
  issues: IRCFAIssues[];
  detail: IRCFAIssues;
  addIssue: (data, callback: () => void) => void;
  editIssue: (_id: string, doc: any) => void;
  removeIssue: (_id: string) => void;
  closeIssue: (_id: string) => void;
  createRootAction: (variables: any) => void;
  mainTypeId: string;
  mainType: string;
};

type State = {
  issues: any[];
  toShow: string[];
};

class RCFASection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      issues: props.issues || [],
      toShow: []
    };
  }

  componentDidMount() {
    if (
      _loadsh.isEmpty(this.props.detail || {}) &&
      !this.state?.issues?.length
    ) {
      this.setState({
        issues: [{ issue: '', _id: Math.random(), isEditing: true }]
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.issues) !== JSON.stringify(this.props.issues)
    ) {
      this.setState({ issues: this.props.issues });
    }
  }

  handleSave(
    {
      _id,
      value,
      parentId
    }: {
      _id?: string;
      value: string;
      parentId?: string;
    },
    callback: () => void
  ) {
    const { detail, editIssue, addIssue } = this.props;

    if (!_loadsh.isEmpty(detail) && typeof _id === 'string') {
      return editIssue(_id, { issue: value });
    }

    addIssue({ issue: value, parentId }, callback);
  }

  renderResolveForm({ issueId, callback }) {
    const { mainType, mainTypeId } = this.props;

    const trigger = (
      <Button btnStyle="success">{__('Set Root a Cause')}</Button>
    );

    const resolverContent = ({ closeModal }) => {
      return (
        <ResolverModal
          mainType={mainType}
          mainTypeId={mainTypeId}
          issueId={issueId}
          closeModal={closeModal}
          callback={callback}
        />
      );
    };

    return (
      <ModalTrigger
        title="Create related card"
        content={resolverContent}
        trigger={trigger}
      />
    );
  }

  renderRootActionForm(issue) {
    const { createRootAction } = this.props;

    if (issue?.relType && issue?.relTypeId) {
      return null;
    }

    const trigger = <Button btnStyle="warning">{__('Create Action')}</Button>;

    const content = ({ closeModal }) => {
      const formContent = (formProps: IFormProps) => {
        const handleSave = e => {
          if (e.key === 'Enter') {
            const { value } = e.currentTarget as HTMLInputElement;
            const payload = {
              issueId: issue._id,
              name: value
            };
            createRootAction(payload);
            closeModal();
          }
        };
        return (
          <>
            <FormGroup>
              <ControlLabel required>{__('Name')}</ControlLabel>
              <FormControl
                required
                {...formProps}
                type="text"
                name="name"
                onKeyPress={handleSave}
              />
            </FormGroup>
          </>
        );
      };

      return <CommonForm renderContent={formContent} />;
    };

    return <ModalTrigger title="RCFA" trigger={trigger} content={content} />;
  }

  renderTree(closeModal, level: number, issues, parentId?) {
    level++;

    const { toShow } = this.state;
    const { closeIssue, editIssue } = this.props;
    const issueIds = issues.map(issue => issue._id);
    const selectedIssueId = toShow.find(id => issueIds.includes(id));
    const selectedIssue = this.state.issues.find(
      issue => issue._id === selectedIssueId
    );

    const handleAddIssue = () => {
      this.setState({
        issues: [
          ...this.state.issues,
          {
            issue: '',
            _id: Math.random(),
            isEditing: true,
            ...(parentId && { parentId })
          }
        ]
      });
    };

    const selectTab = _id => {
      const updatedToShow = toShow.filter(id => !issueIds.includes(id));

      if (toShow.includes(_id)) {
        return this.setState({ toShow: updatedToShow });
      }

      this.setState({ toShow: [...updatedToShow, _id] });
    };
    const onChangeIssue = (e, _id) => {
      const { value } = e.currentTarget as HTMLInputElement;

      const updateIssues = this.state.issues.map(issue =>
        issue._id === _id ? { ...issue, issue: value } : issue
      );

      this.setState({ issues: updateIssues });
    };

    const handleSaveIssue = (e, _id, parentId) => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget as HTMLInputElement;
        const updatedIssues = issues.map(issue =>
          issue._id === _id ? { ...issue, isEditing: !issue.isEditing } : issue
        );

        this.handleSave({ _id, value, ...(parentId && { parentId }) }, () =>
          this.setState({ issues: updatedIssues })
        );
      }
    };

    const handleDescription = e => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget as HTMLInputElement;

        editIssue(selectedIssue._id, { description: value });
      }
    };

    const handleRemoveIssue = _id => {
      confirm().then(() => {
        this.props.removeIssue(_id);
      });
    };

    const handleAddRoot = () => {
      this.setState({
        issues: [
          ...this.state.issues,
          {
            issue: '',
            _id: Math.random(),
            isEditing: true,
            parentId: selectedIssueId
          }
        ]
      });
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {(issues || []).map(issue => {
              if (issue.isEditing) {
                return (
                  <FormControl
                    type="text"
                    value={issue?.issue}
                    onChange={e => onChangeIssue(e, issue._id)}
                    onKeyPress={e =>
                      handleSaveIssue(e, issue._id, issue.parentId)
                    }
                  />
                );
              }

              return (
                <TabTitle
                  key={issue._id}
                  onClick={selectTab.bind(this, issue._id)}
                  className={toShow.includes(issue._id) ? 'active' : ''}
                >
                  {issue.issue}
                  <TabAction onClick={handleRemoveIssue.bind(this, issue._id)}>
                    <Icon icon="times-circle" />
                  </TabAction>
                </TabTitle>
              );
            })}
            {this.props.detail.status === 'inProgress' &&
              selectedIssue?.status === 'inProgress' && (
                <Button
                  style={{ marginLeft: 'auto' }}
                  btnStyle="link"
                  icon="focus-add"
                  onClick={handleAddIssue}
                />
              )}
          </Tabs>
        </TriggerTabs>
        {toShow.some(id => issueIds.includes(id)) && (
          <>
            <StyledContent>
              <FormGroup>
                <ControlLabel>{'Desciption'}</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  defaultValue={selectedIssue?.description}
                  onKeyPress={handleDescription}
                  disabled={selectedIssue.status !== 'inProgress'}
                />
              </FormGroup>
              <ModalFooter style={{ paddingBottom: '20px' }}>
                {this.props.detail.status === 'inProgress' &&
                  selectedIssue?.status === 'inProgress' && (
                    <>
                      {!selectedIssue?.relType && !selectedIssue?.relTypeId && (
                        <Button
                          btnStyle="danger"
                          onClick={closeIssue.bind(this, selectedIssue._id)}
                        >
                          {__('Close this root')}
                        </Button>
                      )}
                      {this.renderRootActionForm(selectedIssue)}
                      {this.renderResolveForm({
                        issueId: selectedIssue._id,
                        callback: closeModal
                      })}
                    </>
                  )}
              </ModalFooter>
            </StyledContent>
            {this.state.issues.find(issue => issue.parentId === selectedIssueId)
              ? level < 5 &&
                this.renderTree(
                  closeModal,
                  level,
                  this.state.issues.filter(
                    issue => issue.parentId === selectedIssueId
                  ),
                  selectedIssueId
                )
              : selectedIssue.status == 'inProgress' && (
                  <LinkButton onClick={handleAddRoot}>
                    {__('Add root')}
                  </LinkButton>
                )}
          </>
        )}
      </>
    );
  }

  renderContent() {
    const { issues } = this.state;
    const { removeIssue, detail } = this.props;

    let icon = 'plus-circle';

    if (!_loadsh.isEmpty(detail)) {
      icon = 'edit-alt';
      if (detail.status !== 'inProgress') {
        icon = 'search';
      }
    }

    const trigger = (
      <Button btnStyle="simple">
        <Icon icon={icon} />
      </Button>
    );

    const content = ({ closeModal }) => {
      return this.renderTree(
        closeModal,
        0,
        issues.filter(issue => !issue.parentId),
        null
      );
    };

    return (
      <ModalTrigger
        title="RCFA"
        size="xl"
        trigger={trigger}
        content={content}
      />
    );
  }

  render() {
    const { detail } = this.props;
    const { issues } = this.props;

    const extraButtons = <BarItems>{this.renderContent()}</BarItems>;

    return (
      <Box title="RCFA" name="name" extraButtons={extraButtons} isOpen>
        <StyledContent>
          {!_loadsh.isEmpty(detail || {}) && issues.length > 0 ? (
            <p>{issues[issues?.length - 1]?.issue}</p>
          ) : (
            <p>No questions there.</p>
          )}
        </StyledContent>
      </Box>
    );
  }
}

export default RCFASection;
