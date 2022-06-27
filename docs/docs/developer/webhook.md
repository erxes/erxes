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
  "data": "{\"type\":\"contacts:customer\",\"newData\":{\"state\":\"customer\",\"firstName\":\"firstname\",\"lastName\":\"lastname\",\"middleName\":\"\",\"hasAuthority\":\"No\",\"isSubscribed\":\"Yes\",\"links\":{},\"sex\":null,\"emailValidationStatus\":\"unknown\",\"phoneValidationStatus\":\"unknown\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\"},\"object\":{\"_id\":\"oj3d8MqAMgFY56wj2\",\"state\":\"customer\",\"sex\":null,\"emails\":[],\"emailValidationStatus\":\"unknown\",\"phones\":[],\"phoneValidationStatus\":\"unknown\",\"status\":\"Active\",\"hasAuthority\":\"No\",\"doNotDisturb\":\"No\",\"isSubscribed\":\"Yes\",\"relatedIntegrationIds\":[],\"tagIds\":[],\"mergedIds\":[],\"deviceTokens\":[],\"scopeBrandIds\":[],\"createdAt\":\"2022-06-27T05:29:47.499Z\",\"modifiedAt\":\"2022-06-27T05:29:47.499Z\",\"firstName\":\"firstname\",\"lastName\":\"lastname\",\"middleName\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"customFieldsData\":[],\"profileScore\":15,\"searchText\":\"  firstname lastname\",\"trackedData\":[],\"__v\":0},\"description\":\"\\\"firstname\\\" has been created\",\"extraDesc\":[{\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</customer/details/oj3d8MqAMgFY56wj2|Customer has been created>",
  "content": "Customer has been created",
  "url": "/customer/details/oj3d8MqAMgFY56wj2",
  "action": "create",
  "type": "contacts:customer"
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
  "data": "{\"type\":\"contacts:customer\",\"object\":{\"_id\":\"oj3d8MqAMgFY56wj2\",\"state\":\"customer\",\"sex\":null,\"emails\":[],\"emailValidationStatus\":\"unknown\",\"phones\":[],\"phoneValidationStatus\":\"unknown\",\"status\":\"Active\",\"hasAuthority\":\"No\",\"doNotDisturb\":\"No\",\"isSubscribed\":\"Yes\",\"relatedIntegrationIds\":[],\"tagIds\":[],\"mergedIds\":[],\"deviceTokens\":[],\"scopeBrandIds\":[],\"createdAt\":\"2022-06-27T05:29:47.499Z\",\"modifiedAt\":\"2022-06-27T05:29:47.499Z\",\"firstName\":\"firstname\",\"lastName\":\"lastname\",\"middleName\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"customFieldsData\":[],\"profileScore\":15,\"searchText\":\"  firstname lastname\",\"trackedData\":[],\"__v\":0},\"newData\":{\"avatar\":null,\"firstName\":\"firstname\",\"lastName\":\"lastname\",\"middleName\":\"\",\"primaryEmail\":\"test@mail4.com\",\"emails\":[\"test@mail4.com\"],\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"hasAuthority\":\"No\",\"isSubscribed\":\"Yes\",\"links\":{},\"sex\":null,\"birthDate\":null,\"emailValidationStatus\":\"unknown\",\"phoneValidationStatus\":\"unknown\"},\"updatedDocument\":{\"_id\":\"oj3d8MqAMgFY56wj2\",\"state\":\"customer\",\"sex\":null,\"emails\":[\"test@mail4.com\"],\"emailValidationStatus\":\"unknown\",\"phones\":[],\"phoneValidationStatus\":\"unknown\",\"status\":\"Active\",\"hasAuthority\":\"No\",\"doNotDisturb\":\"No\",\"isSubscribed\":\"Yes\",\"relatedIntegrationIds\":[],\"tagIds\":[],\"mergedIds\":[],\"deviceTokens\":[],\"scopeBrandIds\":[],\"createdAt\":\"2022-06-27T05:29:47.499Z\",\"modifiedAt\":\"2022-06-27T05:38:35.723Z\",\"firstName\":\"firstname\",\"lastName\":\"lastname\",\"middleName\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"customFieldsData\":[],\"profileScore\":30,\"searchText\":\"test@mail4.com  firstname lastname\",\"trackedData\":[],\"__v\":0,\"avatar\":null,\"birthDate\":null,\"links\":{},\"primaryEmail\":\"test@mail4.com\"},\"description\":\"\\\"firstname\\\" has been updated\",\"extraDesc\":[{\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</customer/details/oj3d8MqAMgFY56wj2|Customer has been updated>",
  "content": "Customer has been updated",
  "url": "/customer/details/oj3d8MqAMgFY56wj2",
  "action": "update",
  "type": "contacts:customer"
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

#### Task created

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:task\",\"newData\":{\"name\":\"test task\",\"proccessId\":\"0.1941863535892714\",\"aboveItemId\":\"\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946},\"object\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[],\"modifiedAt\":\"2022-06-27T04:08:54.608Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"name\":\"test task\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test task \",\"_id\":\"uBQDBWwmfZCP6p4su\",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"description\":\"\\\"test task\\\" has been created\",\"extraDesc\":[{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|task has been created>",
  "content": "task has been created",
  "url": "/task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "create",
  "type": "cards:task"
}
```

</details>

#### Task updated

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:task\",\"object\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:08:54.608Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test task\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test task \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"newData\":{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\"},\"updatedDocument\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test task\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test task \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"description\":\"\\\"test task\\\" has been updated\",\"extraDesc\":[{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"labelIds\":\"4THYXpzxFK4r46ZBr\",\"name\":\"test label\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"labelIds\":\"4THYXpzxFK4r46ZBr\",\"name\":\"test label\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|task has been updated>",
  "content": "task has been updated",
  "url": "/task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "update",
  "type": "cards:task"
}
```

</details>

#### Task moved

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"action\":\"createBoardItemMovementLog\",\"data\":{\"item\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test task\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test task \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"contentType\":\"task\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"activityLogContent\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"},\"link\":\"/task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su\",\"action\":\"moved\",\"contentId\":\"uBQDBWwmfZCP6p4su\",\"createdBy\":\"n2ZhBqXBtDEXfmhuv\",\"content\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"}}}",
  "text": "</task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|task with name test task has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх>",
  "content": "task with name test task has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх",
  "url": "/task/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "createBoardItemMovementLog",
  "type": "cards:task"
}
```

</details>

#### Task deleted

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:task\",\"object\":{\"_id\":\"uBQDBWwmfZCP6p4su\"}}",
  "text": "",
  "content": "task has been deleted",
  "url": "",
  "action": "delete",
  "type": "cards:task"
}
```

</details>

#### Deal created

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:deal\",\"newData\":{\"name\":\"test deal\",\"proccessId\":\"0.1941863535892714\",\"aboveItemId\":\"\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946},\"object\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[],\"modifiedAt\":\"2022-06-27T04:08:54.608Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"name\":\"test deal\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test deal \",\"_id\":\"uBQDBWwmfZCP6p4su\",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"description\":\"\\\"test deal\\\" has been created\",\"extraDesc\":[{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|deal has been created>",
  "content": "deal has been created",
  "url": "/deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "create",
  "type": "cards:deal"
}
```

</details>

#### Deal updated

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:deal\",\"object\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:08:54.608Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test deal\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test deal \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"newData\":{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\"},\"updatedDocument\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test deal\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test deal \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"description\":\"\\\"test deal\\\" has been updated\",\"extraDesc\":[{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"labelIds\":\"4THYXpzxFK4r46ZBr\",\"name\":\"test label\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"labelIds\":\"4THYXpzxFK4r46ZBr\",\"name\":\"test label\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|deal has been updated>",
  "content": "deal has been updated",
  "url": "/deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "update",
  "type": "cards:deal"
}
```

</details>

#### Deal moved

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"action\":\"createBoardItemMovementLog\",\"data\":{\"item\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test deal\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test deal \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"contentType\":\"deal\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"activityLogContent\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"},\"link\":\"/deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su\",\"action\":\"moved\",\"contentId\":\"uBQDBWwmfZCP6p4su\",\"createdBy\":\"n2ZhBqXBtDEXfmhuv\",\"content\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"}}}",
  "text": "</deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|deal with name test deal has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх>",
  "content": "deal with name test deal has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх",
  "url": "/deal/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "createBoardItemMovementLog",
  "type": "cards:deal"
}
```

</details>

#### Deal deleted

<details>

<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:deal\",\"object\":{\"_id\":\"uBQDBWwmfZCP6p4su\"}}",
  "text": "",
  "content": "deal has been deleted",
  "url": "",
  "action": "delete",
  "type": "cards:deal"
}
```

</details>

#### Ticket created

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:ticket\",\"newData\":{\"name\":\"test ticket\",\"proccessId\":\"0.1941863535892714\",\"aboveItemId\":\"\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946},\"object\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[],\"modifiedAt\":\"2022-06-27T04:08:54.608Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"name\":\"test ticket\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test ticket \",\"_id\":\"uBQDBWwmfZCP6p4su\",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"description\":\"\\\"test ticket\\\" has been created\",\"extraDesc\":[{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|ticket has been created>",
  "content": "ticket has been created",
  "url": "/ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "create",
  "type": "cards:ticket"
}
```

</details>

#### Ticket updated

<details>
<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:ticket\",\"object\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:08:54.608Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test ticket\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test ticket \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"newData\":{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\"},\"updatedDocument\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test ticket\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test ticket \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"description\":\"\\\"test ticket\\\" has been updated\",\"extraDesc\":[{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"labelIds\":\"4THYXpzxFK4r46ZBr\",\"name\":\"test label\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"watchedUserIds\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"labelIds\":\"4THYXpzxFK4r46ZBr\",\"name\":\"test label\"},{\"stageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"name\":\"Платформ бэлэн болох\"},{\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|ticket has been updated>",
  "content": "ticket has been updated",
  "url": "/ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "update",
  "type": "cards:ticket"
}
```

</details>

#### Ticket moved

<details>
<summary>
click to see sample data
</summary>

```json
{"data":"{\"action\":\"createBoardItemMovementLog\",\"data\":{\"item\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test ticket\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test ticket \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"contentType\":\"ticket\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"activityLogContent\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"},\"link\":\"/ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su\",\"action\":\"moved\",\"contentId\":\"uBQDBWwmfZCP6p4su\",\"createdBy\":\"n2ZhBqXBtDEXfmhuv\",\"content\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"}}}","text":"</ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|ticket with name test ticket has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх>","content":"ticket with name test ticket has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх","url":"/ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su","action":"createBoardItemMovementLog","type":"cards:ticket"}
```

</details>

#### Ticket deleted

<details>

<summary>
click to see sample data
</summary>

```json
{
  "data": "{\"type\":\"cards:ticket\",\"object\":{\"_id\":\"uBQDBWwmfZCP6p4su\"}}",
  "text": "",
  "content": "ticket has been deleted",
  "url": "",
  "action": "delete",
  "type": "cards:ticket"
}
```

</details>
