const exmGetLast = `
  query exmGetLast {
    exmGetLast {
      _id
      name
      description
      createdAt
      
      features {
        _id
        icon
        name
        description
        contentType
        contentId
        subContentId
      }
      
      welcomeContent {
        _id
        title
        content
        image {
          url 
          name
          type
          size
        }
      }
      
      appearance {
        primaryColor
        secondaryColor
      }
      
      logo {
        url
        name
        type
        size
      }
    }
  }
`;

export default { exmGetLast };
