module.exports = {
  deals: {
    name: "deals",
    description: "Deals",
    actions: [
      {
        name: "dealsAll",
        description: "All",
        use: [
          "showDeals",
          "dealBoardsAdd",
          "dealBoardsEdit",
          "dealBoardsRemove",
          "dealPipelinesAdd",
          "dealPipelinesEdit",
          "dealPipelinesUpdateOrder",
          "dealPipelinesWatch",
          "dealPipelinesRemove",
          "dealPipelinesArchive",
          "dealPipelinesCopied",
          "dealStagesAdd",
          "dealStagesEdit",
          "dealStagesUpdateOrder",
          "dealStagesRemove",
          "dealsAdd",
          "dealsEdit",
          "dealsRemove",
          "dealsWatch",
          "dealsArchive",
          "dealsSort",
          "exportDeals",
          "dealUpdateTimeTracking",
          'dealUpdateProductsData',
          'dealRemoveProductsData',
        ]
      },
      {
        name: "showDeals",
        description: "Show deals"
      },
      {
        name: "dealBoardsAdd",
        description: "Add deal board"
      },
      {
        name: "dealBoardsRemove",
        description: "Remove deal board"
      },
      {
        name: "dealPipelinesAdd",
        description: "Add deal pipeline"
      },
      {
        name: "dealPipelinesEdit",
        description: "Edit deal pipeline"
      },
      {
        name: "dealPipelinesRemove",
        description: "Remove deal pipeline"
      },
      {
        name: "dealPipelinesArchive",
        description: "Archive deal pipeline"
      },
      {
        name: "dealPipelinesCopied",
        description: "Duplicate deal pipeline"
      },
      {
        name: "dealPipelinesUpdateOrder",
        description: "Update pipeline order"
      },
      {
        name: "dealPipelinesWatch",
        description: "Deal pipeline watch"
      },
      {
        name: "dealStagesAdd",
        description: "Add deal stage"
      },
      {
        name: "dealStagesEdit",
        description: "Edit deal stage"
      },
      {
        name: "dealStagesUpdateOrder",
        description: "Update stage order"
      },
      {
        name: "dealStagesRemove",
        description: "Remove deal stage"
      },
      {
        name: "dealsAdd",
        description: "Add deal"
      },
      {
        name: "dealsEdit",
        description: "Edit deal"
      },
      {
        name: "dealsRemove",
        description: "Remove deal"
      },
      {
        name: "dealsWatch",
        description: "Watch deal"
      },
      {
        name: "dealsArchive",
        description: "Archive all deals in a specific stage"
      },
      {
        name: "dealsSort",
        description: "Sort all deals in a specific stage"
      },
      {
        name: "exportDeals",
        description: "Export deals"
      },
      {
        name: "dealUpdateTimeTracking",
        description: "Update time tracking"
      },
      {
        name: "dealUpdateProductsData",
        description: "Update products data"
      },
      {
        name: "dealRemoveProductsData",
        description: "Remove products data"
      }
    ]
  }
};
