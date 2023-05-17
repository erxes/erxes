import {
  Button,
  ModalTrigger,
  NameCard,
  Tabs,
  TabTitle,
  TextInfo,
  Tip,
  __
} from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import moment from 'moment';
import React from 'react';
import { ColorBox, FormContainer, TriggerTabs } from '../../../styles';
import {
  IndicatorAssessmentHistory,
  IndicatorSubmissions
} from '../../common/types';
import { renderSubmission } from '../../components/Detail';

type Props = {
  assessmentsHistory: IndicatorAssessmentHistory[];
  setHistory: (submissions: any) => void;
};

type State = {
  currentUserId: string;
};

class AssessmentHistory extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentUserId: ''
    };
  }

  renderContent({
    closeModal,
    submissions
  }: {
    closeModal: () => void;
    submissions: IndicatorSubmissions[];
  }) {
    const { currentUserId } = this.state;
    const handleSelect = _id => {
      this.setState({ currentUserId: _id });
    };

    const onClick = () => {
      const { setHistory } = this.props;

      const fields =
        (submissions.find(({ _id }) => _id === currentUserId) || {}).fields ||
        [];

      const doc = {};

      for (const field of fields || []) {
        doc[field.fieldId] = {
          value: field.value,
          description: field.description
        };
      }

      setHistory(doc);
      closeModal();
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full>
            {(submissions || []).map(submission => (
              <TabTitle
                key={submission._id}
                className={currentUserId ? 'active' : ''}
                onClick={handleSelect.bind(this, submission._id)}
              >
                <NameCard user={submission.user} />
              </TabTitle>
            ))}
          </Tabs>
        </TriggerTabs>
        {currentUserId &&
          renderSubmission(
            (submissions.find(({ _id }) => _id === currentUserId) || {})
              .fields || []
          )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Cancel')}
          </Button>
          {currentUserId && (
            <Button btnStyle="success" onClick={onClick}>
              {'Use this indicator submit history'}
            </Button>
          )}
        </ModalFooter>
      </>
    );
  }

  renderItem(assessmentHistory: IndicatorAssessmentHistory) {
    const trigger = (
      <div key={assessmentHistory._id}>
        <Tip
          text={
            <FormContainer column gapBetween={5}>
              <TextInfo textStyle="simple">
                {`Started At: ${moment(assessmentHistory.createdAt).format(
                  'll HH:mm'
                )}`}
              </TextInfo>
              <TextInfo textStyle="simple">
                {`End At: ${moment(assessmentHistory.closedAt).format(
                  'll HH:mm'
                )}`}
              </TextInfo>
            </FormContainer>
          }
        >
          <ColorBox
            color={assessmentHistory.statusColor || ''}
            pointer={true}
          />
        </Tip>
      </div>
    );

    const content = props =>
      this.renderContent({
        ...props,
        submissions: assessmentHistory.submissions
      });

    return (
      <ModalTrigger
        key={assessmentHistory._id}
        title="Indicator Submissions"
        content={content}
        trigger={trigger}
      />
    );
  }

  render() {
    const { assessmentsHistory } = this.props;

    return (
      <FormContainer row gap>
        <h4>{assessmentsHistory[0]?.indicator?.name || ''}</h4>
        <FormContainer row gapBetween={5} padding={'15px 0'}>
          {(assessmentsHistory || []).map(assessmentHistory =>
            this.renderItem(assessmentHistory)
          )}
        </FormContainer>
      </FormContainer>
    );
  }
}

export default AssessmentHistory;
