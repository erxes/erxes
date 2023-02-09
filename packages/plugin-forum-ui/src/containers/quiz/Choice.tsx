import React, { FC, useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import QuizChoiceForm, {
  ChoiceEditable,
  Choice
} from '../../components/QuizChoiceForm';

const MUT_PATCH = gql`
  mutation ForumQuizChoicePatch(
    $_id: ID!
    $imageUrl: String
    $isCorrect: Boolean
    $listOrder: Float
    $text: String
  ) {
    forumQuizChoicePatch(
      _id: $_id
      imageUrl: $imageUrl
      isCorrect: $isCorrect
      listOrder: $listOrder
      text: $text
    ) {
      _id
    }
  }
`;

const MUT_DEL = gql`
  mutation ForumQuizChoiceDelete($_id: ID!) {
    forumQuizChoiceDelete(_id: $_id) {
      _id
    }
  }
`;

type Props = {
  choice: Choice;
  refetch?(): any;
  index?: number;
};

const ChoiceDetail: FC<Props> = ({ choice, refetch, index }) => {
  const { _id, questionId, ...editable } = choice;
  const [isEditing, setIsEditing] = useState(false);
  const [mutPatch] = useMutation(MUT_PATCH, {
    onCompleted: refetch || (() => {})
  });
  const [mutDel] = useMutation(MUT_DEL, {
    onCompleted: refetch || (() => {})
  });

  const onEditSubmit = async variables => {
    await mutPatch({
      variables: {
        ...variables,
        _id
      }
    });
    setIsEditing(false);
  };

  return (
    <tr>
      <td>{choice.isCorrect && ' ✓ '}</td>
      <td>{index != null && `${index + 1}. `}</td>
      <td>{choice.text}</td>
      <td>
        <button type="button" onClick={() => setIsEditing(true)}>
          Edit
        </button>

        <button
          type="button"
          onClick={async () => {
            if (!confirm('Are you sure you want to delete this choice?'))
              return;
            await mutDel({ variables: { _id } });
          }}
        >
          Delete
        </button>

        <QuizChoiceForm
          show={isEditing}
          choice={editable}
          onSubmit={onEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </td>
    </tr>
  );
};

export default ChoiceDetail;
