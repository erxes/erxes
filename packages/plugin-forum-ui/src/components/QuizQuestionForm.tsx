import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { CATEGORIES_ALL } from '../graphql/queries';
import { Modal } from 'react-bootstrap';

type Question = {
  _id: string;
  text?: string | null;
  imageUrl?: string | null;
  isMultipleChoice: boolean;
  listOrder: number;
};

type Props = {
  question?: Question;
  onSubmit(question: Omit<Question, '_id'>): any;
  onCancel(): any;
  show: boolean;
};

const QuizQuestionForm: React.FC<Props> = ({
  question,
  onSubmit,
  show,
  onCancel
}) => {
  const [text, setText] = React.useState(question?.text || '');
  const [imageUrl, setImageUrl] = React.useState(question?.imageUrl || '');
  const [isMultipleChoice, setIsMultipleChoice] = React.useState(
    question?.isMultipleChoice || false
  );
  const [listOrder, setListOrder] = React.useState(
    String(question?.listOrder) || '0'
  );

  useEffect(() => {
    if (show) {
      setText(question?.text || '');
      setImageUrl(question?.imageUrl || '');
      setIsMultipleChoice(question?.isMultipleChoice || false);
      setListOrder(String(question?.listOrder) || '0');
    }
  }, [show]);

  const _onSubmit = e => {
    e.preventDefault();
    onSubmit({
      text,
      imageUrl,
      isMultipleChoice,
      listOrder: Number(listOrder) || 0
    });
  };

  return (
    <Modal size={'xl'} show={show} enforceFocus centered>
      <Modal.Body>
        <form onSubmit={_onSubmit}>
          <div className="form-group">
            <label htmlFor="text">Text</label>
            <input
              type="text"
              className="form-control"
              id="text"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              className="form-control"
              id="imageUrl"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="isMultipleChoice">Multiple Choice</label>
            <input
              type="checkbox"
              id="isMultipleChoice"
              checked={isMultipleChoice}
              onChange={e => setIsMultipleChoice(e.target.checked)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="listOrder">List Order</label>
            <input
              type="number"
              className="form-control"
              id="listOrder"
              value={listOrder}
              onChange={e => setListOrder(e.target.value)}
            />
          </div>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Submit</button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default QuizQuestionForm;
