---
id: webhook
title: webhook
sidebar_label: Webhook
---

<p>Webhooks allow you to talk to any backend or third-party services. It is a combination of elements that collectively create a notification and reaction system. Webhooks provide a powerful method to track the state of events and to take action within your erxes. Read on to ensure your webhooks function seamlessly with your integration. You can find out how to create a webhook on erxes <a href="https://www.loom.com/share/41b9411fc4434b73a795d9f4c8724f03" target="_blank">
here</a>.
</p>

### Samples

#### Customer created

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "create",
    "type": "customer",
    "newData": {
      "state": "customer",
      "firstName": "sarah",
      "lastName": "connor",
      "primaryEmail": "sarahconner@mail.com",
      "emails": ["sarahconner@mail.com"],
      "primaryPhone": "017664888-44",
      "phones": ["017664888-44"],
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "position": "",
      "department": "",
      "hasAuthority": "No",
      "description": "",
      "doNotDisturb": "No",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "sex": 0,
      "emailValidationStatus": "unknown",
      "phoneValidationStatus": "unknown",
      "customFieldsData": []
    },
    "object": {
      "state": "customer",
      "sex": 0,
      "emails": ["sarahconner@mail.com"],
      "emailValidationStatus": "unknown",
      "phones": ["017664888-44"],
      "phoneValidationStatus": "unknown",
      "status": "Active",
      "hasAuthority": "No",
      "doNotDisturb": "No",
      "relatedIntegrationIds": [],
      "tagIds": [],
      "mergedIds": [],
      "deviceTokens": [],
      "scopeBrandIds": [],
      "_id": "nMZ7qvzfaAK4rsvF2",
      "createdAt": "2020-10-16T00:20:17.248Z",
      "modifiedAt": "2020-10-16T00:20:17.248Z",
      "firstName": "sarah",
      "lastName": "connor",
      "primaryEmail": "sarahconner@mail.com",
      "primaryPhone": "017664888-44",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "position": "",
      "department": "",
      "description": "",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "customFieldsData": [],
      "profileScore": 40,
      "searchText": "sarahconner@mail.com 017664888-44 sarah connor",
      "trackedData": []
    }
  }
}
```

</details>

#### Customer updated

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "update",
    "type": "customer",
    "object": {
      "state": "customer",
      "sex": 0,
      "emails": ["sarahconner@mail.com"],
      "emailValidationStatus": "unknown",
      "phones": ["017664888-44"],
      "phoneValidationStatus": "unknown",
      "status": "Active",
      "hasAuthority": "No",
      "doNotDisturb": "No",
      "relatedIntegrationIds": [],
      "tagIds": [],
      "mergedIds": [],
      "deviceTokens": [],
      "scopeBrandIds": [],
      "_id": "nMZ7qvzfaAK4rsvF2",
      "createdAt": "2020-10-16T00:20:17.248Z",
      "modifiedAt": "2020-10-16T00:20:17.248Z",
      "firstName": "sarah",
      "lastName": "connor",
      "primaryEmail": "sarahconner@mail.com",
      "primaryPhone": "017664888-44",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "position": "",
      "department": "",
      "description": "",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "customFieldsData": [],
      "profileScore": 40,
      "searchText": "sarahconner@mail.com 017664888-44 sarah connor",
      "trackedData": [],
      "__v": 0
    },
    "newData": {
      "avatar": null,
      "firstName": "sarah",
      "lastName": "connor",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "position": "",
      "department": "",
      "hasAuthority": "No",
      "description": "",
      "doNotDisturb": "No",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "sex": 0,
      "birthDate": null,
      "emailValidationStatus": "valid",
      "phoneValidationStatus": "unknown",
      "subdomain": "ari"
    },
    "updatedDocument": {
      "state": "customer",
      "sex": 0,
      "emails": ["sarahconner@mail.com"],
      "emailValidationStatus": "valid",
      "phones": ["017664888-44"],
      "phoneValidationStatus": "unknown",
      "status": "Active",
      "hasAuthority": "No",
      "doNotDisturb": "No",
      "relatedIntegrationIds": [],
      "tagIds": [],
      "mergedIds": [],
      "deviceTokens": [],
      "scopeBrandIds": [],
      "_id": "nMZ7qvzfaAK4rsvF2",
      "createdAt": "2020-10-16T00:20:17.248Z",
      "modifiedAt": "2020-10-16T00:27:55.958Z",
      "firstName": "sarah",
      "lastName": "connor",
      "primaryEmail": "sarahconner@mail.com",
      "primaryPhone": "017664888-44",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "position": "",
      "department": "",
      "description": "",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "customFieldsData": [],
      "profileScore": 40,
      "searchText": "sarahconner@mail.com 017664888-44 sarah connor",
      "trackedData": [],
      "__v": 0,
      "avatar": null,
      "birthDate": null
    }
  }
}
```

</details>

#### Customer deleted

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "type": "customer",
    "action": "delete",
    "object": {
      "_id": "nMZ7qvzfaAK4rsvF2"
    }
  }
}
```

</details>

#### Company created

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "create",
    "type": "company",
    "newData": {
      "primaryName": "Tesla",
      "names": ["Tesla"],
      "size": 0,
      "industry": "Automobiles",
      "parentCompanyId": "",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "businessType": "Other",
      "description": "",
      "doNotDisturb": "No",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": ""
    },
    "object": {
      "names": ["Tesla"],
      "emails": [],
      "phones": [],
      "status": "Active",
      "doNotDisturb": "No",
      "tagIds": [],
      "mergedIds": [],
      "scopeBrandIds": [],
      "primaryName": "Tesla",
      "size": 0,
      "industry": "Automobiles",
      "parentCompanyId": "",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "businessType": "Other",
      "description": "",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "customFieldsData": [],
      "createdAt": "2020-10-16T00:42:47.402Z",
      "modifiedAt": "2020-10-16T00:42:47.402Z",
      "searchText": "Tesla    Automobiles   ",
      "_id": "w4qKSJMfv2zrZKjyY"
    }
  }
}
```

</details>

#### Company updated

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "update",
    "type": "company",
    "object": {
      "names": ["Tesla"],
      "emails": [],
      "phones": [],
      "status": "Active",
      "doNotDisturb": "No",
      "tagIds": [],
      "mergedIds": [],
      "scopeBrandIds": [],
      "_id": "w4qKSJMfv2zrZKjyY",
      "primaryName": "Tesla",
      "size": 0,
      "industry": "Automobiles",
      "parentCompanyId": "",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "businessType": "Other",
      "description": "",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": ""
      },
      "code": "",
      "customFieldsData": [],
      "createdAt": "2020-10-16T00:42:47.402Z",
      "modifiedAt": "2020-10-16T00:42:47.402Z",
      "searchText": "Tesla    Automobiles   ",
      "__v": 0
    },
    "newData": {
      "avatar": null,
      "size": 0,
      "industry": "Automobiles",
      "parentCompanyId": "",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "businessType": "Other",
      "description": "",
      "doNotDisturb": "No",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": "https://www.tesla.com/"
      },
      "code": ""
    },
    "updatedDocument": {
      "names": ["Tesla"],
      "emails": [],
      "phones": [],
      "status": "Active",
      "doNotDisturb": "No",
      "tagIds": [],
      "mergedIds": [],
      "scopeBrandIds": [],
      "_id": "w4qKSJMfv2zrZKjyY",
      "primaryName": "Tesla",
      "size": 0,
      "industry": "Automobiles",
      "parentCompanyId": "",
      "ownerId": "qLsLeYeW2nnWjiMMy",
      "businessType": "Other",
      "description": "",
      "links": {
        "facebook": "",
        "twitter": "",
        "youtube": "",
        "website": "https://www.tesla.com/"
      },
      "code": "",
      "customFieldsData": [],
      "createdAt": "2020-10-16T00:42:47.402Z",
      "modifiedAt": "2020-10-16T00:43:39.852Z",
      "searchText": "Tesla    Automobiles   ",
      "__v": 0,
      "avatar": null
    }
  }
}
```

</details>

#### Company deleted

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "delete",
    "type": "company",
    "object": {
      "_id": "qvGD8Hqc5iacaK6Yp"
    }
  }
}
```

</details>

#### Knowledgebase article created

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "create",
    "type": "knowledgeBaseArticle",
    "newData": {
      "title": "habitasse platea dictumst quisque sagittis",
      "summary": "viverra orci sagittis eu volutpat odio facilisis mauris sit amet",
      "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Congue eu consequat ac felis donec et odio pellentesque. Id donec ultrices tincidunt arcu non sodales neque. Nisi vitae suscipit tellus mauris. Id cursus metus aliquam eleifend mi in. In arcu cursus euismod quis viverra nibh cras. Eu augue ut lectus arcu bibendum at varius vel pharetra. Pellentesque habitant morbi tristique senectus. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Amet aliquam id diam maecenas ultricies mi.</p>nn<p>Cras fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Rhoncus mattis rhoncus urna neque viverra justo nec ultrices. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Ac turpis egestas sed tempus urna et. Euismod nisi porta lorem mollis aliquam ut porttitor. Etiam non quam lacus suspendisse faucibus. Quisque non tellus orci ac auctor augue mauris augue. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Nunc sed augue lacus viverra vitae congue. Ullamcorper sit amet risus nullam eget felis eget nunc lobortis. Ligula ullamcorper malesuada proin libero. In dictum non consectetur a. Sagittis id consectetur purus ut. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Vel pretium lectus quam id leo. Purus non enim praesent elementum facilisis leo. Viverra justo nec ultrices dui sapien eget mi proin sed. Enim nec dui nunc mattis enim. Nam at lectus urna duis convallis convallis tellus.</p>nn<p>Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum. Odio pellentesque diam volutpat commodo sed egestas egestas. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Non diam phasellus vestibulum lorem sed. Adipiscing elit duis tristique sollicitudin nibh sit. Fusce id velit ut tortor pretium viverra suspendisse potenti. Pretium fusce id velit ut tortor. Risus commodo viverra maecenas accumsan lacus vel. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. At lectus urna duis convallis. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Accumsan lacus vel facilisis volutpat est velit egestas. Neque viverra justo nec ultrices dui. Et odio pellentesque diam volutpat commodo sed egestas egestas. Aliquam faucibus purus in massa. Cursus sit amet dictum sit amet. Lectus sit amet est placerat in egestas erat.</p>n",
      "status": "publish",
      "reactionChoices": [
        "https://erxes.s3.amazonaws.com/icons/sad.svg",
        "https://erxes.s3.amazonaws.com/icons/neutral.svg",
        "https://erxes.s3.amazonaws.com/icons/grinning.svg",
        "https://erxes.s3.amazonaws.com/icons/like.svg",
        "https://erxes.s3.amazonaws.com/icons/dislike.svg"
      ],
      "categoryIds": ["6pn4pdib2vtEaoW7C"],
      "createdBy": "qLsLeYeW2nnWjiMMy",
      "createdDate": "2020-10-16T00:47:33.635Z"
    },
    "object": {
      "status": "publish",
      "reactionChoices": [
        "https://erxes.s3.amazonaws.com/icons/sad.svg",
        "https://erxes.s3.amazonaws.com/icons/neutral.svg",
        "https://erxes.s3.amazonaws.com/icons/grinning.svg",
        "https://erxes.s3.amazonaws.com/icons/like.svg",
        "https://erxes.s3.amazonaws.com/icons/dislike.svg"
      ],
      "title": "habitasse platea dictumst quisque sagittis",
      "summary": "viverra orci sagittis eu volutpat odio facilisis mauris sit amet",
      "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Congue eu consequat ac felis donec et odio pellentesque. Id donec ultrices tincidunt arcu non sodales neque. Nisi vitae suscipit tellus mauris. Id cursus metus aliquam eleifend mi in. In arcu cursus euismod quis viverra nibh cras. Eu augue ut lectus arcu bibendum at varius vel pharetra. Pellentesque habitant morbi tristique senectus. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Amet aliquam id diam maecenas ultricies mi.</p>nn<p>Cras fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Rhoncus mattis rhoncus urna neque viverra justo nec ultrices. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Ac turpis egestas sed tempus urna et. Euismod nisi porta lorem mollis aliquam ut porttitor. Etiam non quam lacus suspendisse faucibus. Quisque non tellus orci ac auctor augue mauris augue. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Nunc sed augue lacus viverra vitae congue. Ullamcorper sit amet risus nullam eget felis eget nunc lobortis. Ligula ullamcorper malesuada proin libero. In dictum non consectetur a. Sagittis id consectetur purus ut. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Vel pretium lectus quam id leo. Purus non enim praesent elementum facilisis leo. Viverra justo nec ultrices dui sapien eget mi proin sed. Enim nec dui nunc mattis enim. Nam at lectus urna duis convallis convallis tellus.</p>nn<p>Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum. Odio pellentesque diam volutpat commodo sed egestas egestas. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Non diam phasellus vestibulum lorem sed. Adipiscing elit duis tristique sollicitudin nibh sit. Fusce id velit ut tortor pretium viverra suspendisse potenti. Pretium fusce id velit ut tortor. Risus commodo viverra maecenas accumsan lacus vel. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. At lectus urna duis convallis. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Accumsan lacus vel facilisis volutpat est velit egestas. Neque viverra justo nec ultrices dui. Et odio pellentesque diam volutpat commodo sed egestas egestas. Aliquam faucibus purus in massa. Cursus sit amet dictum sit amet. Lectus sit amet est placerat in egestas erat.</p>n",
      "createdDate": "2020-10-16T00:47:33.635Z",
      "createdBy": "qLsLeYeW2nnWjiMMy",
      "modifiedDate": "2020-10-16T00:47:33.635Z",
      "_id": "bCwkjqnYXJsutaSQu"
    }
  }
}
```

</details>

#### Knowledgebase article updated

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "update",
    "type": "knowledgeBaseArticle",
    "object": {
      "status": "publish",
      "reactionChoices": [
        "https://erxes.s3.amazonaws.com/icons/sad.svg",
        "https://erxes.s3.amazonaws.com/icons/neutral.svg",
        "https://erxes.s3.amazonaws.com/icons/grinning.svg",
        "https://erxes.s3.amazonaws.com/icons/like.svg",
        "https://erxes.s3.amazonaws.com/icons/dislike.svg"
      ],
      "_id": "bCwkjqnYXJsutaSQu",
      "title": "habitasse platea dictumst quisque sagittis",
      "summary": "viverra orci sagittis eu volutpat odio facilisis mauris sit amet",
      "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Congue eu consequat ac felis donec et odio pellentesque. Id donec ultrices tincidunt arcu non sodales neque. Nisi vitae suscipit tellus mauris. Id cursus metus aliquam eleifend mi in. In arcu cursus euismod quis viverra nibh cras. Eu augue ut lectus arcu bibendum at varius vel pharetra. Pellentesque habitant morbi tristique senectus. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Amet aliquam id diam maecenas ultricies mi.</p>nn<p>Cras fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Rhoncus mattis rhoncus urna neque viverra justo nec ultrices. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Ac turpis egestas sed tempus urna et. Euismod nisi porta lorem mollis aliquam ut porttitor. Etiam non quam lacus suspendisse faucibus. Quisque non tellus orci ac auctor augue mauris augue. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Nunc sed augue lacus viverra vitae congue. Ullamcorper sit amet risus nullam eget felis eget nunc lobortis. Ligula ullamcorper malesuada proin libero. In dictum non consectetur a. Sagittis id consectetur purus ut. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Vel pretium lectus quam id leo. Purus non enim praesent elementum facilisis leo. Viverra justo nec ultrices dui sapien eget mi proin sed. Enim nec dui nunc mattis enim. Nam at lectus urna duis convallis convallis tellus.</p>nn<p>Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum. Odio pellentesque diam volutpat commodo sed egestas egestas. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Non diam phasellus vestibulum lorem sed. Adipiscing elit duis tristique sollicitudin nibh sit. Fusce id velit ut tortor pretium viverra suspendisse potenti. Pretium fusce id velit ut tortor. Risus commodo viverra maecenas accumsan lacus vel. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. At lectus urna duis convallis. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Accumsan lacus vel facilisis volutpat est velit egestas. Neque viverra justo nec ultrices dui. Et odio pellentesque diam volutpat commodo sed egestas egestas. Aliquam faucibus purus in massa. Cursus sit amet dictum sit amet. Lectus sit amet est placerat in egestas erat.</p>n",
      "createdDate": "2020-10-16T00:47:33.635Z",
      "createdBy": "qLsLeYeW2nnWjiMMy",
      "modifiedDate": "2020-10-16T00:47:33.635Z",
      "__v": 0
    },
    "newData": {
      "title": "habitasse platea dictumst quisque sagittis",
      "summary": "viverra orci sagittis eu volutpat odio facilisis mauris sit amets",
      "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Congue eu consequat ac felis donec et odio pellentesque. Id donec ultrices tincidunt arcu non sodales neque. Nisi vitae suscipit tellus mauris. Id cursus metus aliquam eleifend mi in. In arcu cursus euismod quis viverra nibh cras. Eu augue ut lectus arcu bibendum at varius vel pharetra. Pellentesque habitant morbi tristique senectus. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Amet aliquam id diam maecenas ultricies mi.</p>nn<p>Cras fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Rhoncus mattis rhoncus urna neque viverra justo nec ultrices. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Ac turpis egestas sed tempus urna et. Euismod nisi porta lorem mollis aliquam ut porttitor. Etiam non quam lacus suspendisse faucibus. Quisque non tellus orci ac auctor augue mauris augue. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Nunc sed augue lacus viverra vitae congue. Ullamcorper sit amet risus nullam eget felis eget nunc lobortis. Ligula ullamcorper malesuada proin libero. In dictum non consectetur a. Sagittis id consectetur purus ut. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Vel pretium lectus quam id leo. Purus non enim praesent elementum facilisis leo. Viverra justo nec ultrices dui sapien eget mi proin sed. Enim nec dui nunc mattis enim. Nam at lectus urna duis convallis convallis tellus.</p>nn<p>Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum. Odio pellentesque diam volutpat commodo sed egestas egestas. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Non diam phasellus vestibulum lorem sed. Adipiscing elit duis tristique sollicitudin nibh sit. Fusce id velit ut tortor pretium viverra suspendisse potenti. Pretium fusce id velit ut tortor. Risus commodo viverra maecenas accumsan lacus vel. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. At lectus urna duis convallis. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Accumsan lacus vel facilisis volutpat est velit egestas. Neque viverra justo nec ultrices dui. Et odio pellentesque diam volutpat commodo sed egestas egestas. Aliquam faucibus purus in massa. Cursus sit amet dictum sit amet. Lectus sit amet est placerat in egestas erat.</p>n",
      "status": "publish",
      "reactionChoices": [],
      "categoryIds": ["6pn4pdib2vtEaoW7C"],
      "modifiedBy": "qLsLeYeW2nnWjiMMy",
      "modifiedDate": "2020-10-16T00:48:01.513Z"
    },
    "updatedDocument": {
      "status": "publish",
      "reactionChoices": [],
      "_id": "bCwkjqnYXJsutaSQu",
      "title": "habitasse platea dictumst quisque sagittis",
      "summary": "viverra orci sagittis eu volutpat odio facilisis mauris sit amets",
      "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Congue eu consequat ac felis donec et odio pellentesque. Id donec ultrices tincidunt arcu non sodales neque. Nisi vitae suscipit tellus mauris. Id cursus metus aliquam eleifend mi in. In arcu cursus euismod quis viverra nibh cras. Eu augue ut lectus arcu bibendum at varius vel pharetra. Pellentesque habitant morbi tristique senectus. Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Amet aliquam id diam maecenas ultricies mi.</p>nn<p>Cras fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Rhoncus mattis rhoncus urna neque viverra justo nec ultrices. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Ac turpis egestas sed tempus urna et. Euismod nisi porta lorem mollis aliquam ut porttitor. Etiam non quam lacus suspendisse faucibus. Quisque non tellus orci ac auctor augue mauris augue. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Nunc sed augue lacus viverra vitae congue. Ullamcorper sit amet risus nullam eget felis eget nunc lobortis. Ligula ullamcorper malesuada proin libero. In dictum non consectetur a. Sagittis id consectetur purus ut. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Vel pretium lectus quam id leo. Purus non enim praesent elementum facilisis leo. Viverra justo nec ultrices dui sapien eget mi proin sed. Enim nec dui nunc mattis enim. Nam at lectus urna duis convallis convallis tellus.</p>nn<p>Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum. Odio pellentesque diam volutpat commodo sed egestas egestas. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Non diam phasellus vestibulum lorem sed. Adipiscing elit duis tristique sollicitudin nibh sit. Fusce id velit ut tortor pretium viverra suspendisse potenti. Pretium fusce id velit ut tortor. Risus commodo viverra maecenas accumsan lacus vel. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. At lectus urna duis convallis. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Accumsan lacus vel facilisis volutpat est velit egestas. Neque viverra justo nec ultrices dui. Et odio pellentesque diam volutpat commodo sed egestas egestas. Aliquam faucibus purus in massa. Cursus sit amet dictum sit amet. Lectus sit amet est placerat in egestas erat.</p>n",
      "createdDate": "2020-10-16T00:47:33.635Z",
      "createdBy": "qLsLeYeW2nnWjiMMy",
      "modifiedDate": "2020-10-16T00:48:01.513Z",
      "__v": 0,
      "modifiedBy": "qLsLeYeW2nnWjiMMy"
    }
  }
}
```

</details>

#### Knowledgebase article deleted

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": {
    "action": "delete",
    "type": "knowledgeBaseArticle",
    "object": {
      "_id": "bCwkjqnYXJsutaSQu"
    }
  }
}
```

</details>

#### Admin message inserted

<details>
<summary>
click to see sample data
</summary>

```json
{
  "action": "create",
  "type": "userMessages",
  "data": {
    "mentionedUserIds": [],
    "contentType": "text",
    "_id": "bWHNk34jEYiTrQhC7",
    "internal": false,
    "conversationId": "C3g2xw2vFe3ckPXCM",
    "content": "<p>Hello, </p>n<p><em>Thanks for reaching out! Our support reps will check your message and forward to the best person when necessary. We'll get back to you within 48 hours.</em><br>n </p>n<p><em>If your issue can't wait, you can also reach us via live chat on www.website.com/en/ or call 555-555-5555.</em><br>n </p>n<p><em>Best regards,</em></p>n<p>Support team </p>",
    "attachments": [],
    "userId": "qLsLeYeW2nnWjiMMy",
    "createdAt": "2020-10-16T00:49:51.536Z"
  }
}
```

</details>

#### Customer create conversation

<details>
<summary>
click to see sample data
</summary>

```json
{
  "action": "create",
  "type": "conversation",
  "data": {
    "participatedUserIds": [],
    "readUserIds": [],
    "tagIds": [],
    "status": "open",
    "customerId": "p4BuzsQrgXsjf64Rt",
    "integrationId": "KJvHJq9SKqQQ2Wnfq",
    "operatorStatus": "operator",
    "content": "hi i have a couple of questions",
    "createdAt": "2020-10-16T00:51:14.616Z",
    "updatedAt": "2020-10-16T00:51:14.616Z",
    "number": 912,
    "messageCount": 0,
    "_id": "2H73nD9zsLnyXmLkS"
  }
}
```

</details>

#### Customer messages

<details>
<summary>
click to see sample data
</summary>

```json
{
  "action": "create",
  "type": "customerMessages",
  "data": {
    "mentionedUserIds": [],
    "contentType": "text",
    "internal": false,
    "conversationId": "2H73nD9zsLnyXmLkS",
    "customerId": "p4BuzsQrgXsjf64Rt",
    "attachments": [],
    "content": "hi i have a couple of questions",
    "createdAt": "2020-10-16T00:51:14.622Z",
    "_id": "KNPsP2uAZWpNBmudJ"
  }
}
```

</details>

#### Engage messages

<details>
<summary>
click to see sample data
</summary>

```json
{
  "action": "create",
  "type": "engageMessages",
  "data": {
    "segmentIds": [],
    "brandIds": ["dCcuLW6hgAnAEAK6M"],
    "customerIds": [],
    "tagIds": [],
    "messengerReceivedCustomerIds": [],
    "scopeBrandIds": [],
    "title": "hello",
    "kind": "manual",
    "method": "messenger",
    "fromUserId": "qLsLeYeW2nnWjiMMy",
    "isDraft": false,
    "isLive": true,
    "scheduleDate": null,
    "messenger": {
      "brandId": "dCcuLW6hgAnAEAK6M",
      "kind": "chat",
      "sentAs": "snippet",
      "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. In cursus turpis massa tincidunt dui ut ornare. Lectus proin nibh nisl condimentum id venenatis a condimentum vitae. At auctor urna nunc id. Convallis tellus id interdum velit laoreet id. Facilisis magna etiam tempor orci eu lobortis elementum nibh tellus. Tincidunt id aliquet risus feugiat in ante metus. Id interdum velit laoreet id donec ultrices tincidunt arcu non. Amet consectetur adipiscing elit ut aliquam purus sit amet. Habitant morbi tristique senectus et netus. Neque sodales ut etiam sit. Etiam sit amet nisl purus in mollis nunc sed id. Eget aliquet nibh praesent tristique magna sit. Et tortor at risus viverra adipiscing. Vestibulum mattis ullamcorper velit sed ullamcorper morbi. Odio ut sem nulla pharetra diam sit amet. Ultrices neque ornare aenean euismod elementum.</p>n",
      "rules": []
    },
    "_id": "ZGFZf8YMsoeRmhjhm",
    "createdAt": "2020-10-16T00:53:40.872Z"
  }
}
```

</details>

#### Form submission received

<details>
<summary>
click to see sample data
</summary>

```json
{
  "action": "create",
  "type": "popupSubmitted",
  "data": {
    "formId": "T9CsvuCZsAdNPkF9M",
    "submissions": [
      {
        "_id": "xFNMyfYApAHrMW787",
        "type": "email",
        "validation": null,
        "text": "email",
        "value": "user1@gmail.com"
      },
      {
        "_id": "4YM9KSMSPvyMA4cKE",
        "type": "phone",
        "validation": null,
        "text": "phone",
        "value": "+976 99114433"
      }
    ],
    "customer": {
      "subdomain": "test",
      "location": {
        "remoteAddress": "183.81.168.0/22",
        "region": "Ulaanbaatar",
        "countryCode": "MN",
        "city": "Ulaanbaatar",
        "country": "Mongolia",
        "url": "/Users/soyombobat-erdene/Documents/multipurpose/index.html",
        "hostname": "file://",
        "language": "en-US",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
      },
      "firstName": "",
      "lastName": "",
      "emails": ["user1@gmail.com"],
      "primaryEmail": "user1@gmail.com",
      "phones": ["+976 99114433"],
      "primaryPhone": "+976 99114433",
      "emailValidationStatus": "unknown",
      "phoneValidationStatus": "unknown"
    },
    "cachedCustomerId": "p4BuzsQrgXsjf64Rt"
  }
}
```

</details>
