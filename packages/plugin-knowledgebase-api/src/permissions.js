module.exports = {
  knowledgeBase: {
    name: "knowledgeBase",
    description: "KnowledgeBase",
    actions: [
      {
        name: "knowledgeBaseAll",
        description: "All",
        use: ["showKnowledgeBase", "manageKnowledgeBase"],
      },
      {
        name: "manageKnowledgeBase",
        description: "Manage knowledge base",
      },
      {
        name: "showKnowledgeBase",
        description: "Show knowledge base",
      },
    ],
  },
};