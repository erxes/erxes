import React, { useState, useEffect } from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Modal from 'react-bootstrap/Modal';
import { __, readFile } from 'coreui/utils';
import {
  SpaceFormsWrapper,
  CommentWrapper,
  TicketComment,
  CreatedUser,
  CommentContent
} from '@erxes/ui-settings/src/styles';
import Table from '@erxes/ui/src/components/table';
import { ColorButton } from '../../boards/styles/common';
import { gql, useQuery, useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { queries, mutations } from '../graphql/';

function Comment(item) {
  const typeId = item.item._id;
  const type = item.item.stage.type;

  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalComments),
    {
      variables: { typeId: typeId, type: type },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    }
  );
  const [clientPortalCommentsRemove] = useMutation(
    gql(mutations.clientPortalCommentsRemove)
  );

  const clientPortalComments = data ? data.clientPortalComments || [] : [];
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <ColorButton onClick={handleShow}>
        <Icon icon="comment-alt-message" />
        {__('Comment')}
      </ColorButton>

      <Modal
        centered
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{__('Comments')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SpaceFormsWrapper>
            <CommentWrapper>
              {clientPortalComments.map(comment => {
                const { createdUser = {} } = comment;

                return (
                  <TicketComment key={comment._id}>
                    <CreatedUser>
                      <img
                        src={readFile(
                          createdUser && createdUser.avatar
                            ? createdUser?.avatar
                            : '/static/avatar-colored.svg'
                        )}
                        alt="profile"
                      />
                      <div>
                        <CommentContent>
                          <h5>{`${createdUser?.firstName} ${createdUser?.lastName}`}</h5>
                          <div
                            className="comment"
                            dangerouslySetInnerHTML={{
                              __html: comment.content
                            }}
                          />
                        </CommentContent>
                        <span>
                          Reported{' '}
                          {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </div>
                      <div className="actions"></div>
                    </CreatedUser>
                  </TicketComment>
                );
              })}
            </CommentWrapper>
          </SpaceFormsWrapper>
          <Modal.Footer>
            <Button
              btnStyle="simple"
              size="small"
              icon="times-circle"
              onClick={handleClose}
            >
              {__('Cancel')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Comment;
