import {
  Audio,
  CallWrapper,
  Download,
  StatusContent,
  StatusIcon,
} from "./styles";
import { ICallHistory, IConversation } from "@erxes/ui-inbox/src/inbox/types";
import {
  MessageBody,
  MessageItem,
} from "@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/styles";
import React, { useRef } from "react";

import { AppConsumer } from "coreui/appContext";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";
import { can } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import { readFile } from "@erxes/ui/src/utils/core";
import ReactAudioPlayer from "react-audio-player";
import { gql, useQuery } from "@apollo/client";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries } from "@erxes/ui-inbox/src/inbox/graphql";

type Props = {
  conversation: IConversation;
  currentUser: IUser;
};

const GrandStream: React.FC<Props> = ({ conversation, currentUser }) => {
  const audioRef = useRef<ReactAudioPlayer | null>(null);
  const {
    callDuration,
    callStatus,
    callType,
    createdAt,
    recordUrl,
    customerPhone,
    operatorPhone,
  } = conversation.callHistory || ({} as ICallHistory);
  const { loading, error, data } = useQuery(
    gql(queries.userConversationsByCustomerId),
    {
      variables: {
        customerId: conversation.customerId,
      },
    },
  );

  if (loading) {
    return <Spinner />;
  }

  const audioTitle =
    `operatorPhone:${operatorPhone}-` +
    `customerPhone:${customerPhone}-` +
    `${callType}:${callStatus}` +
    dayjs(createdAt).format("YYYY-MM-DD HH:mm");

  const handleDownload = () => {
    const audioSrc = audioRef.current?.audioEl.current?.src; // Correct way to get audio src

    if (audioSrc) {
      fetch(audioSrc)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.blob();
        })
        .then((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `${audioTitle}.wav`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        })
        .catch((error) =>
          console.error("Error downloading the audio file:", error),
        );
    }
  };

  const renderDownloadAudio = () => {
    if (!can("showCallRecord", currentUser) || !recordUrl) {
      return null;
    }
    return (
      <Tip text={__("Download audio")} placement="top">
        <Download href="#" onClick={handleDownload} id="downloadButton">
          <Icon icon="download-1" size={16} />
        </Download>
      </Tip>
    );
  };

  const renderAudio = () => {
    return (
      can("showCallRecord", currentUser) && (
        <Audio>
          <ReactAudioPlayer
            ref={audioRef}
            src={readFile(recordUrl)}
            controls
            controlsList="nodownload"
          />
        </Audio>
      )
    );
  };

  const renderIcon = () => {
    switch (callStatus) {
      case "connected":
        return "missed-call";
      case "missed":
        return "missed-call";
      case "cancelled":
        return "phone-times";
      default:
        return "phone-slash";
    }
  };

  const renderCallStatus = () => {
    switch (callStatus) {
      case "connected":
        return "Call ended";
      case "missed":
        return "Missed call";
      case "cancelled":
        return "Call cancelled";
      default:
        return "Outgoing call";
    }
  };

  const groupConversationsByTags = (conversations: any[]) => {
    const grouped: any = {};

    conversations.forEach((conversation) => {
      const tags = conversation.tags || [];

      if (tags.length === 0) {
        if (!grouped["No tags"]) {
          grouped["No tags"] = {
            conversations: [],
            assignedUsers: new Set(),
          };
        }

        grouped["No tags"].conversations.push(conversation);
        if (conversation.assignedUser) {
          grouped["No tags"].assignedUsers.add(conversation.assignedUser);
        }
      } else {
        tags.forEach((tag) => {
          const tagName = tag.name;
          if (!grouped[tagName]) {
            grouped[tagName] = {
              conversations: [],
              assignedUsers: new Set(),
            };
          }

          grouped[tagName].conversations.push(conversation);
          if (conversation.assignedUser) {
            grouped[tagName].assignedUsers.add(conversation.assignedUser);
          }
        });
      }
    });

    return grouped;
  };

  const renderConversationGroups = () => {
    if (!data?.userConversationsByCustomerId?.length) {
      return null;
    }

    const conversations = data.userConversationsByCustomerId;
    const grouped = groupConversationsByTags(conversations);

    return (
      <div
        style={{
          marginTop: 20,
          marginLeft: 52,
          padding: 0,
          background: "transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 16,
            gap: 8,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="history" style={{ color: "#6B7280", fontSize: 12 }} />
          </div>
          <h6
            style={{
              margin: 0,
              color: "#111827",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Conversation History
          </h6>
          <span
            style={{
              background: "#E5E7EB",
              color: "#6B7280",
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {conversations.length}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {Object.entries(grouped).map(([tagName, groupData]) => {
            const assignedUsers = Array.from(groupData.assignedUsers);
            const assignedUser =
              assignedUsers.length > 0 ? assignedUsers[0] : null;

            return (
              <div
                key={tagName}
                style={{
                  padding: "16px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D1D5DB";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    {tagName !== "No tags" && (
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                          color: "#FFFFFF",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        [{tagName}]
                      </span>
                    )}
                    {tagName === "No tags" && (
                      <span
                        style={{
                          background: "#F9FAFB",
                          color: "#6B7280",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        No tags
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      background: "#F0FDF4",
                      color: "#166534",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    {groupData.conversations.length}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #F3F4F6",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: assignedUser ? "#FEF3C7" : "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      icon="user"
                      style={{
                        fontSize: 10,
                        color: assignedUser ? "#D97706" : "#6B7280",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontWeight: 500,
                    }}
                  >
                    {assignedUser ? assignedUser.username : "Unassigned"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <MessageItem>
        <NameCard.Avatar customer={conversation.customer} size={40} />

        <MessageBody>
          <CallWrapper>
            <StatusContent>
              <div>
                <StatusIcon type={callStatus}>
                  <Icon icon={renderIcon()} size={16} />
                </StatusIcon>
                <div>
                  <h5>
                    {__(renderCallStatus())} ({callType})
                  </h5>
                  <span>Call duration: {callDuration}s</span>
                </div>
              </div>
              <div>{renderDownloadAudio()}</div>
            </StatusContent>
            {recordUrl && renderAudio()}
          </CallWrapper>
          <Tip text={dayjs(createdAt).format("lll")}>
            <footer>{dayjs(createdAt).format("LT")}</footer>
          </Tip>
        </MessageBody>
      </MessageItem>
      {renderConversationGroups()}
    </div>
  );
};

const WithConsumer = (props: { conversation: IConversation }) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <GrandStream {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
