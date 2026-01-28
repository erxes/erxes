// import React, { useState } from 'react';
// import { useQuery } from '@apollo/client';
// import styled from '@emotion/styled';
// import { Button } from 'erxes-ui';

// import { IMAP_CONVERSATION_DETAIL_QUERY } from '../graphql/queries/imapQueries';
// import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';

// /* =====================
//    Types
// ===================== */

// interface EmailAddress {
//   name?: string;
//   email?: string;
//   avatar?: string;
// }

// interface MailData {
//   from?: EmailAddress[];
//   to?: EmailAddress[];
//   cc?: EmailAddress[];
//   subject?: string;
//   body?: string;
// }

// interface Conversation {
//   _id: string;
//   createdAt: string;
//   mailData: MailData;
// }

// interface ImapConversationDetailResponse {
//   imapConversationDetail: Conversation[];
// }

// /* =====================
//    Styled components
// ===================== */

// const EmailContainer = styled.div`
//   background: #fff;
//   border: 1px solid #e1e4e8;
//   border-radius: 8px;
//   display: flex;
//   flex-direction: column;
//   height: 100%;
// `;

// const EmailHeader = styled.div`
//   padding: 16px 20px;
//   border-bottom: 1px solid #e1e4e8;
// `;

// const EmailSubject = styled.h2`
//   margin: 12px 0 0;
//   font-size: 20px;
//   font-weight: 600;
//   color: #24292e;
// `;

// const EmailMeta = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 6px;
// `;

// const MetaItem = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   font-size: 13px;
//   color: #57606a;

//   strong {
//     color: #24292e;
//     font-weight: 600;
//   }
// `;

// const Avatar = styled.img`
//   width: 26px;
//   height: 26px;
//   border-radius: 50%;
//   object-fit: cover;
// `;

// /* 🔥 scroll wrapper */
// const EmailBodyWrapper = styled.div`
//   flex: 1;
//   overflow-y: auto;
//   border-top: 1px solid #f1f3f5;
//   border-bottom: 1px solid #f1f3f5;
// `;

// const EmailBody = styled.div`
//   padding: 20px;
//   font-size: 14px;
//   line-height: 1.55;
//   color: #24292e;

//   p {
//     margin: 10px 0;
//   }

//   em,
//   i {
//     font-style: italic;
//   }

//   img {
//     max-width: 100%;
//     border-radius: 6px;
//     margin: 12px 0;
//   }

//   blockquote {
//     font-style: italic;
//     color: #57606a;
//     border-left: 3px solid #d0d7de;
//     padding-left: 12px;
//     margin: 12px 0;
//   }
// `;

// const EmailTimestamp = styled.div`
//   margin-top: 16px;
//   font-size: 12px;
//   color: #6a737d;
// `;

// const EmailActions = styled.div`
//   padding: 10px 16px;
//   border-bottom: 1px solid #e1e4e8;
//   background: #fafbfc;
//   display: flex;
//   gap: 10px;
// `;

// const ReplyContainer = styled.div`
//   padding: 12px 16px;
//   background: #fafbfc;
// `;

// const ReplyEditor = styled.div`
//   max-height: 140px;
//   overflow-y: auto;
//   padding: 10px 12px;
//   border: 1px solid #d1d5db;
//   border-radius: 6px;
//   font-size: 14px;
//   line-height: 1.5;

//   em,
//   i {
//     font-style: italic;
//   }

//   &:focus {
//     outline: none;
//     border-color: #6366f1;
//   }
// `;

// const ReplyActions = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   gap: 10px;
//   margin-top: 10px;
// `;

// const Center = styled.div`
//   padding: 40px;
//   text-align: center;
// `;

// /* =====================
//    Utils
// ===================== */

// const formatEmails = (emails?: EmailAddress[]) => {
//   if (!emails || !emails.length) return '';
//   return emails
//     .map((e) => (e.name ? `${e.name} <${e.email}>` : e.email))
//     .join(', ');
// };

// /* =====================
//    Components
// ===================== */

// const EmailMetaInfo: React.FC<{ mailData: MailData }> = ({ mailData }) => {
//   const from = mailData.from?.[0];

//   return (
//     <EmailMeta>
//       <MetaItem>
//         {from?.avatar && <Avatar src={from.avatar} alt={from.name} />}
//         <span>
//           <strong>From:</strong> {formatEmails(mailData.from)}
//         </span>
//       </MetaItem>
//       <MetaItem>
//         <strong>To:</strong> {formatEmails(mailData.to)}
//       </MetaItem>
//       {mailData.cc && mailData.cc.length > 0 && (
//         <MetaItem>
//           <strong>Cc:</strong> {formatEmails(mailData.cc)}
//         </MetaItem>
//       )}
//     </EmailMeta>
//   );
// };

// const EmailActionsPanel = () => (
//   <EmailActions>
//     <Button size="small" icon="reply-1">
//       Reply
//     </Button>
//     <Button size="small" icon="forward">
//       Forward
//     </Button>
//   </EmailActions>
// );

// const ReplySection = () => {
//   const [html, setHtml] = useState('');

//   const handleSend = () => {
//     if (!html.trim()) return;
//     console.log('SEND HTML:', html);
//     setHtml('');
//   };

//   return (
//     <ReplyContainer>
//       <ReplyEditor
//         contentEditable
//         suppressContentEditableWarning
//         onInput={(e) => setHtml(e.currentTarget.innerHTML)}
//         placeholder="Type your reply..."
//       />
//       <ReplyActions>
//         <Button size="small" onClick={() => setHtml('')}>
//           Cancel
//         </Button>
//         <Button size="small" btnStyle="primary" onClick={handleSend}>
//           Send
//         </Button>
//       </ReplyActions>
//     </ReplyContainer>
//   );
// };

// /* =====================
//    Main
// ===================== */

// export const ImapConversationDetail: React.FC = () => {
//   const { _id } = useConversationContext();

//   const { data, loading, error } = useQuery<ImapConversationDetailResponse>(
//     IMAP_CONVERSATION_DETAIL_QUERY,
//     {
//       variables: { conversationId: _id },
//       skip: !_id,
//     },
//   );

//   if (loading) return <Center>Loading email…</Center>;
//   if (error) return <Center>Error: {error.message}</Center>;

//   const conversation = data?.imapConversationDetail?.[0];
//   if (!conversation) return <Center>No email found</Center>;

//   const { mailData, createdAt } = conversation;

//   return (
//     <EmailContainer>
//       <EmailHeader>
//         <EmailMetaInfo mailData={mailData} />
//         <EmailSubject>{mailData.subject}</EmailSubject>
//       </EmailHeader>

//       <EmailBodyWrapper>
//         <EmailBody>
//           <div dangerouslySetInnerHTML={{ __html: mailData.body || '' }} />
//           <EmailTimestamp>
//             {new Date(createdAt).toLocaleString('en-US', {
//               month: 'short',
//               day: '2-digit',
//               hour: '2-digit',
//               minute: '2-digit',
//             })}
//           </EmailTimestamp>
//         </EmailBody>
//       </EmailBodyWrapper>

//       <EmailActionsPanel />
//       <ReplySection />
//     </EmailContainer>
//   );
// };
