import React from "react";
import { gql, useQuery } from "@apollo/client";
import { IConversation } from "@erxes/ui-inbox/src/inbox/types";
import { queries } from "@erxes/ui-inbox/src/inbox/graphql";
import { EmptyState, Icon, Spinner } from "@erxes/ui/src";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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
      variables: { customerId },
      skip: !customerId,
      fetchPolicy: "network-only",
    },
  );

  const MAX_USERS = 3;
  const [openPopoverTag, setOpenPopoverTag] = React.useState<string | null>(
    null,
  );
  const [popoverPos, setPopoverPos] = React.useState<{
    top: number;
    left: number;
  } | null>(null);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <EmptyState text={error.message} />;
  }

  const groupConversationsByTags = (conversation: any[]) => {
    const grouped: any = {};

    conversation.forEach((conversation) => {
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
          grouped["No tags"].assignedUsers.add(conversation.assignedUser._id);
        }
        if (conversation.updatedAt) {
          const currentLatest = grouped["No tags"].latestDate;
          if (
            !currentLatest ||
            new Date(conversation.updatedAt) > new Date(currentLatest)
          ) {
            grouped["No tags"].latestDate = conversation.updatedAt;
          }
        }
      } else {
        tags.forEach((tag: any) => {
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
            grouped[tagName].assignedUsers.add(conversation.assignedUser._id);
          }

          if (conversation.updatedAt) {
            const currentLatest = grouped[tagName].latestDate;
            if (
              !currentLatest ||
              new Date(conversation.updatedAt) > new Date(currentLatest)
            ) {
              grouped[tagName].latestDate = conversation.updatedAt;
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
      <div style={{ marginTop: 20, marginLeft: 52 }}>
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
            <Icon icon="history" style={{ fontSize: 12, color: "#6B7280" }} />
          </div>

          <h6 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
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
            maxHeight: 600,
            overflowY: "auto",
          }}
        >
          {Object.entries(grouped).map(([tagName, groupData]: any) => {
            const usersMap = new Map<string, { user: any; count: number }>();

            groupData.conversations.forEach((c: any) => {
              const u = c.assignedUser;
              if (u?._id) {
                if (!usersMap.has(u._id)) {
                  usersMap.set(u._id, { user: u, count: 1 });
                } else {
                  const old = usersMap.get(u._id)!;
                  usersMap.set(u._id, { user: old.user, count: old.count + 1 });
                }
              }
            });

            const usersWithCount = Array.from(usersMap.values());
            const visibleUsers = usersWithCount.slice(0, MAX_USERS);
            const hiddenCount = usersWithCount.length - MAX_USERS;

            return (
              <div
                key={tagName}
                style={{
                  padding: 16,
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    {tagName === "No tags" ? (
                      <span
                        style={{
                          background: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                        }}
                      >
                        No tags
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#E0E7FF",
                          color: "#1D4ED8",
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        {tagName}
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
                    }}
                  >
                    {groupData.conversations.length}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingTop: 8,
                    borderTop: "1px solid #F3F4F6",
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPopoverPos({
                      top: rect.top - 8,
                      left: rect.left + rect.width / 2,
                    });
                    setOpenPopoverTag(tagName);
                  }}
                  onMouseLeave={() => {
                    setOpenPopoverTag(null);
                    setPopoverPos(null);
                  }}
                >
                  {visibleUsers.map(({ user, count }, i) => (
                    <div
                      key={user._id}
                      style={{
                        position: "relative",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#FEF3C7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: i === 0 ? 0 : -8,
                        border: "2px solid #fff",
                      }}
                    >
                      <Icon
                        icon="user"
                        style={{ fontSize: 10, color: "#D97706" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          backgroundColor: "#D97706",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: 10,
                          fontWeight: "bold",
                          width: 18,
                          height: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                          userSelect: "none",
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  ))}

                  {hiddenCount > 0 && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: -8,
                        fontSize: 10,
                        fontWeight: 600,
                        border: "2px solid #fff",
                      }}
                    >
                      +{hiddenCount}
                    </div>
                  )}

                  {usersWithCount.length === 0 && (
                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                      Unassigned
                    </span>
                  )}
                </div>

                {groupData.latestDate && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#6B7280",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon icon="clock" style={{ fontSize: 10 }} />
                    {dayjs
                      .utc(groupData.latestDate)
                      .add(8, "hour")
                      .format("YYYY-MM-DD HH:mm")}{" "}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {openPopoverTag && popoverPos && (
          <div
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              transform: "translate(-50%, -100%)",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,.15)",
              padding: 8,
              zIndex: 9999,
              minWidth: 180,
            }}
            onMouseEnter={() => setOpenPopoverTag(openPopoverTag)}
            onMouseLeave={() => {
              setOpenPopoverTag(null);
              setPopoverPos(null);
            }}
          >
            {(() => {
              const usersMap = new Map<string, { user: any; count: number }>();
              grouped[openPopoverTag].conversations.forEach((c: any) => {
                const u = c.assignedUser;
                if (u?._id) {
                  if (!usersMap.has(u._id)) {
                    usersMap.set(u._id, { user: u, count: 1 });
                  } else {
                    const old = usersMap.get(u._id)!;
                    usersMap.set(u._id, {
                      user: old.user,
                      count: old.count + 1,
                    });
                  }
                }
              });
              const usersWithCount = Array.from(usersMap.values());

              return usersWithCount.map(({ user, count }) => (
                <div
                  key={user._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon icon="user" style={{ fontSize: 12 }} />
                  <span>{user.username}</span>
                  <span
                    style={{
                      backgroundColor: "#D97706",
                      color: "white",
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: "bold",
                      padding: "2px 6px",
                      userSelect: "none",
                      marginLeft: 8,
                    }}
                  >
                    {count}
                  </span>
                </div>
              ));
            })()}
          </div>
        )}
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
