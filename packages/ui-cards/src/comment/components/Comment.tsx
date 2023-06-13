import React, { useState } from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Modal from 'react-bootstrap/Modal';
import { __, readFile, renderFullName } from 'coreui/utils';
import {
  SpaceFormsWrapper,
  CommentWrapper,
  TicketComment,
  CreatedUser,
  CommentContent
} from '@erxes/ui-settings/src/styles';
import { ColorButton } from '../../boards/styles/common';
import { gql, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { queries } from '../graphql/';

function Comment(item) {
  const typeId = item.item._id;
  const type = item.item.stage.type;

  const { data = {} as any } = useQuery(gql(queries.clientPortalComments), {
    variables: { typeId, type },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

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
        centered={true}
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton={true}>
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
                            ? createdUser.avatar
                            : '/images/avatar-colored.svg'
                        )}
                        alt="profile"
                      />
                      <div>
                        <CommentContent>
                          <h5>
                            {createdUser.fullName
                              ? createdUser.fullName
                              : renderFullName(createdUser)}
                          </h5>
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
