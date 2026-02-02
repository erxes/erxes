import React from "react";
import { gql, useQuery } from "@apollo/client";
import { IConversation } from "@erxes/ui-inbox/src/inbox/types";
import { queries } from "@erxes/ui-inbox/src/inbox/graphql";
import { EmptyState, Icon, Spinner } from "@erxes/ui/src";

type Props = {
  conversation: IConversation;
};

const CallPro: React.FC<Props> = ({ conversation }) => {
  const { callProAudio, customerId } = conversation;

  if (!callProAudio) {
    return <p>You dont have permission to listen</p>;
  }

  const { loading, error, data } = useQuery(
    gql(queries.userConversationsByCustomerId),
    {
      variables: {
        customerId,
      },
      skip: !customerId,
    },
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <EmptyState text={error.message} />;
  }

  const groupConversationsByTags = (conversations: any[]) => {
    const grouped: any = {};

    conversations.forEach((conversation) => {
      const tags = conversation.tags || [];

      if (tags.length === 0) {
        if (!grouped["No tags"]) {
          grouped["No tags"] = {
            conversations: [],
            assignedUsers: new Set(),
            latestDate: null,
          };
        }
        grouped["No tags"].conversations.push(conversation);
        if (conversation.assignedUser) {
          grouped["No tags"].assignedUsers.add(conversation.assignedUser);
        }
        if (conversation.assignedUser?.createdAt) {
          const currentLatest = grouped["No tags"].latestDate;
          if (
            !currentLatest ||
            new Date(conversation.assignedUser.createdAt) >
              new Date(currentLatest)
          ) {
            grouped["No tags"].latestDate = conversation.assignedUser.createdAt;
          }
        }
      } else {
        tags.forEach((tag) => {
          const tagName = tag.name;
          if (!grouped[tagName]) {
            grouped[tagName] = {
              conversations: [],
              assignedUsers: new Set(),
              latestDate: null,
            };
          }

          grouped[tagName].conversations.push(conversation);
          if (conversation.assignedUser) {
            grouped[tagName].assignedUsers.add(conversation.assignedUser);
          }

          if (tag.createdAt) {
            const currentLatest = grouped[tagName].latestDate;
            if (
              !currentLatest ||
              new Date(tag.createdAt) > new Date(currentLatest)
            ) {
              grouped[tagName].latestDate = tag.createdAt;
            }
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

                {groupData.latestDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 8,
                      padding: "6px 8px",
                      background: "#F9FAFB",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Icon
                      icon="clock"
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        fontWeight: 500,
                      }}
                    >
                      {new Date(groupData.latestDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <audio controls>
        <source src={callProAudio} type="audio/ogg" />
      </audio>
      {renderConversationGroups()}
    </>
  );
};

export default CallPro;
