module.exports = {
  documents: {
    name: 'documents',
    description: 'Documents',
    actions: [
      {
        name: 'documentsAll',
        description: 'All',
        use: ['manageDocuments']
      },
      {
        name: 'manageDocuments',
        description: 'Manage documents'
      }
    ]
  }, 
}