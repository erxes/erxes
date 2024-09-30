module.exports = {
  tickets: {
    name: "tickets",
    description: "Tickets",
    actions: [
      {
        name: "ticketsAll",
        description: "All",
        use: [
          "showTickets",
          "ticketBoardsAdd",
          "ticketBoardsEdit",
          "ticketBoardsRemove",
          "ticketPipelinesAdd",
          "ticketPipelinesEdit",
          "ticketPipelinesUpdateOrder",
          "ticketPipelinesWatch",
          "ticketPipelinesRemove",
          "ticketPipelinesArchive",
          "ticketPipelinesCopied",
          "ticketStagesAdd",
          "ticketStagesEdit",
          "ticketStagesUpdateOrder",
          "ticketStagesRemove",
          "ticketsAdd",
          "ticketsEdit",
          "ticketsRemove",
          "ticketsWatch",
          "ticketsArchive",
          "ticketsSort",
          "exportTickets",
          "ticketUpdateTimeTracking"
        ]
      },
      {
        name: "showTickets",
        description: "Show tickets"
      },
      {
        name: "ticketBoardsAdd",
        description: "Add ticket board"
      },
      {
        name: "ticketBoardsRemove",
        description: "Remove ticket board"
      },
      {
        name: "ticketPipelinesAdd",
        description: "Add ticket pipeline"
      },
      {
        name: "ticketPipelinesEdit",
        description: "Edit ticket pipeline"
      },
      {
        name: "ticketPipelinesRemove",
        description: "Remove ticket pipeline"
      },
      {
        name: "ticketPipelinesArchive",
        description: "Archive ticket pipeline"
      },
      {
        name: "ticketPipelinesCopied",
        description: "Duplicate ticket pipeline"
      },
      {
        name: "ticketPipelinesUpdateOrder",
        description: "Update pipeline order"
      },
      {
        name: "ticketPipelinesWatch",
        description: "ticket pipeline watch"
      },
      {
        name: "ticketStagesAdd",
        description: "Add ticket stage"
      },
      {
        name: "ticketStagesEdit",
        description: "Edit ticket stage"
      },
      {
        name: "ticketStagesUpdateOrder",
        description: "Update stage order"
      },
      {
        name: "ticketStagesRemove",
        description: "Remove ticket stage"
      },
      {
        name: "ticketsAdd",
        description: "Add ticket"
      },
      {
        name: "ticketsEdit",
        description: "Edit ticket"
      },
      {
        name: "ticketsRemove",
        description: "Remove ticket"
      },
      {
        name: "ticketsWatch",
        description: "Watch ticket"
      },
      {
        name: "ticketsArchive",
        description: "Archive all tickets in a specific stage"
      },
      {
        name: "ticketsSort",
        description: "Sort all tickets in a specific stage"
      },
      {
        name: "exporttickets",
        description: "Export tickets"
      },
      {
        name: "ticketUpdateTimeTracking",
        description: "Update time tracking"
      }
    ]
  }
};
