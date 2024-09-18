module.exports = {
  purchases: {
    name: "purchases",
    description: "Purchases",
    actions: [
      {
        name: "purchasesAll",
        description: "All",
        use: [
          "showPurchases",
          "purchaseBoardsAdd",
          "purchaseBoardsEdit",
          "purchaseBoardsRemove",
          "purchasePipelinesAdd",
          "purchasePipelinesEdit",
          "purchasePipelinesUpdateOrder",
          "purchasePipelinesWatch",
          "purchasePipelinesRemove",
          "purchasePipelinesArchive",
          "purchasePipelinesCopied",
          "purchaseStagesAdd",
          "purchaseStagesEdit",
          "purchaseStagesUpdateOrder",
          "purchaseStagesRemove",
          "purchasesAdd",
          "purchasesEdit",
          "purchasesRemove",
          "purchasesWatch",
          "purchasesArchive",
          "purchasesSort",
          "exportPurchases",
          "purchaseUpdateTimeTracking"
        ]
      },
      {
        name: "showPurchases",
        description: "Show purchases"
      },
      {
        name: "purchaseBoardsAdd",
        description: "Add purchase board"
      },
      {
        name: "purchaseBoardsRemove",
        description: "Remove purchase board"
      },
      {
        name: "purchasePipelinesAdd",
        description: "Add purchase pipeline"
      },
      {
        name: "purchasePipelinesEdit",
        description: "Edit purchase pipeline"
      },
      {
        name: "purchasePipelinesRemove",
        description: "Remove purchase pipeline"
      },
      {
        name: "purchasePipelinesArchive",
        description: "Archive purchase pipeline"
      },
      {
        name: "purchasePipelinesCopied",
        description: "Duplicate purchase pipeline"
      },
      {
        name: "purchasePipelinesUpdateOrder",
        description: "Update pipeline order"
      },
      {
        name: "purchasePipelinesWatch",
        description: "purchase pipeline watch"
      },
      {
        name: "purchaseStagesAdd",
        description: "Add purchase stage"
      },
      {
        name: "purchaseStagesEdit",
        description: "Edit purchase stage"
      },
      {
        name: "purchaseStagesUpdateOrder",
        description: "Update stage order"
      },
      {
        name: "purchaseStagesRemove",
        description: "Remove purchase stage"
      },
      {
        name: "purchasesAdd",
        description: "Add purchase"
      },
      {
        name: "purchasesEdit",
        description: "Edit purchase"
      },
      {
        name: "purchasesRemove",
        description: "Remove purchase"
      },
      {
        name: "purchasesWatch",
        description: "Watch purchase"
      },
      {
        name: "purchasesArchive",
        description: "Archive all purchases in a specific stage"
      },
      {
        name: "purchasesSort",
        description: "Sort all purchases in a specific stage"
      },
      {
        name: "exportpurchases",
        description: "Export purchases"
      },
      {
        name: "purchaseUpdateTimeTracking",
        description: "Update time tracking"
      }
    ]
  }
};
