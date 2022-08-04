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
  "data": "{\"type\":\"contacts:customer\",\"object\":{\"_id\":\"oj3d8MqAMgFY56wj2\"}}",
  "text": "",
  "content": "Customer has been deleted",
  "url": "/customer/details/oj3d8MqAMgFY56wj2",
  "action": "delete",
  "type": "contacts:customer"
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
  "data": "{\"type\":\"contacts:company\",\"newData\":{\"primaryName\":\"erxes\",\"names\":[\"erxes\"],\"size\":0,\"industry\":\"Software\",\"parentCompanyId\":\"\",\"businessType\":\"\",\"description\":\"\",\"isSubscribed\":\"Yes\",\"links\":{\"facebook\":\"\",\"twitter\":\"\",\"youtube\":\"\",\"website\":\"\"},\"code\":\"\",\"location\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"trackedData\":[],\"emails\":[],\"phones\":[]},\"object\":{\"names\":[\"erxes\"],\"emails\":[],\"phones\":[],\"status\":\"Active\",\"doNotDisturb\":\"No\",\"isSubscribed\":\"Yes\",\"tagIds\":[],\"mergedIds\":[],\"scopeBrandIds\":[],\"primaryName\":\"erxes\",\"size\":0,\"industry\":\"Software\",\"parentCompanyId\":\"\",\"businessType\":\"\",\"description\":\"\",\"links\":{\"facebook\":\"\",\"twitter\":\"\",\"youtube\":\"\",\"website\":\"\"},\"code\":\"\",\"location\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"trackedData\":[],\"customFieldsData\":[],\"createdAt\":\"2022-06-27T05:49:30.219Z\",\"modifiedAt\":\"2022-06-27T05:49:30.219Z\",\"searchText\":\"erxes    Software   \",\"_id\":\"N7J4SywdGQbRjcoCj\",\"__v\":0},\"description\":\"\\\"erxes\\\" has been created\",\"extraDesc\":[{\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</company/details/N7J4SywdGQbRjcoCj|Company has been created>",
  "content": "Company has been created",
  "url": "/company/details/N7J4SywdGQbRjcoCj",
  "action": "create",
  "type": "contacts:company"
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
  "data": "{\"type\":\"contacts:company\",\"object\":{\"names\":[\"erxes\"],\"emails\":[],\"phones\":[],\"status\":\"Active\",\"doNotDisturb\":\"No\",\"isSubscribed\":\"Yes\",\"tagIds\":[],\"mergedIds\":[],\"scopeBrandIds\":[],\"_id\":\"N7J4SywdGQbRjcoCj\",\"primaryName\":\"erxes\",\"size\":0,\"industry\":\"Software\",\"parentCompanyId\":\"\",\"businessType\":\"\",\"description\":\"\",\"links\":{\"facebook\":\"\",\"twitter\":\"\",\"youtube\":\"\",\"website\":\"\"},\"code\":\"\",\"location\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"trackedData\":[],\"customFieldsData\":[],\"createdAt\":\"2022-06-27T05:49:30.219Z\",\"modifiedAt\":\"2022-06-27T05:49:30.219Z\",\"searchText\":\"erxes    Software   \",\"__v\":0},\"newData\":{\"avatar\":null,\"size\":0,\"industry\":\"Software\",\"parentCompanyId\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"businessType\":\"Partner\",\"description\":\"\",\"isSubscribed\":\"Yes\",\"links\":{\"facebook\":\"\",\"twitter\":\"\",\"youtube\":\"\",\"website\":\"\"},\"code\":\"\",\"location\":\"\",\"trackedData\":[],\"emails\":[],\"phones\":[],\"names\":[\"erxes\"]},\"updatedDocument\":{\"names\":[\"erxes\"],\"emails\":[],\"phones\":[],\"status\":\"Active\",\"doNotDisturb\":\"No\",\"isSubscribed\":\"Yes\",\"tagIds\":[],\"mergedIds\":[],\"scopeBrandIds\":[],\"_id\":\"N7J4SywdGQbRjcoCj\",\"primaryName\":\"erxes\",\"size\":0,\"industry\":\"Software\",\"parentCompanyId\":\"\",\"businessType\":\"Partner\",\"description\":\"\",\"links\":{\"facebook\":\"\",\"twitter\":\"\",\"youtube\":\"\",\"website\":\"\"},\"code\":\"\",\"location\":\"\",\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"trackedData\":[],\"customFieldsData\":[],\"createdAt\":\"2022-06-27T05:49:30.219Z\",\"modifiedAt\":\"2022-06-27T05:50:07.847Z\",\"searchText\":\"erxes    Software   \",\"__v\":0,\"avatar\":null},\"description\":\"\\\"erxes\\\" has been updated\",\"extraDesc\":[{\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"},{\"ownerId\":\"n2ZhBqXBtDEXfmhuv\",\"name\":\"admin@erxes.io\"}]}",
  "text": "</company/details/N7J4SywdGQbRjcoCj|Company has been updated>",
  "content": "Company has been updated",
  "url": "/company/details/N7J4SywdGQbRjcoCj",
  "action": "update",
  "type": "contacts:company"
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
  "data": "{\"type\":\"contacts:company\",\"object\":{\"_id\":\"SxRaT6S2jRw96Jqse\"}}",
  "text": "",
  "content": "Company has been deleted",
  "url": "/company/details/SxRaT6S2jRw96Jqse",
  "action": "delete",
  "type": "contacts:company"
}
```

</details>

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
{
  "data": "{\"action\":\"createBoardItemMovementLog\",\"data\":{\"item\":{\"isComplete\":false,\"assignedUserIds\":[],\"watchedUserIds\":[\"n2ZhBqXBtDEXfmhuv\"],\"labelIds\":[\"4THYXpzxFK4r46ZBr\"],\"modifiedAt\":\"2022-06-27T04:11:52.736Z\",\"sourceConversationIds\":[],\"status\":\"active\",\"tagIds\":[],\"_id\":\"uBQDBWwmfZCP6p4su\",\"name\":\"test ticket\",\"stageId\":\"nx3xj6axDDSTKKPbu\",\"initialStageId\":\"nx3xj6axDDSTKKPbu\",\"modifiedBy\":\"n2ZhBqXBtDEXfmhuv\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"order\":5.642541289652946,\"createdAt\":\"2022-06-27T04:08:54.608Z\",\"stageChangedDate\":\"2022-06-27T04:08:54.608Z\",\"searchText\":\"test ticket \",\"attachments\":[],\"customFieldsData\":[],\"relations\":[],\"__v\":0},\"contentType\":\"ticket\",\"userId\":\"n2ZhBqXBtDEXfmhuv\",\"activityLogContent\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"},\"link\":\"/ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su\",\"action\":\"moved\",\"contentId\":\"uBQDBWwmfZCP6p4su\",\"createdBy\":\"n2ZhBqXBtDEXfmhuv\",\"content\":{\"oldStageId\":\"nx3xj6axDDSTKKPbu\",\"destinationStageId\":\"6xJrt6mfQ7LL6DS3o\",\"text\":\"Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх\"}}}",
  "text": "</ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su|ticket with name test ticket has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх>",
  "content": "ticket with name test ticket has moved from Платформ бэлэн болох to 200 ажил олгогчийн дата бүртгэх /Оффлайн борлуулалт 20 байгууллагатай уулзалт хийх",
  "url": "/ticket/board?id=aGZtEhP2PFNpsP828&pipelineId=QMGgALdjFsk9CCPsH&itemId=uBQDBWwmfZCP6p4su",
  "action": "createBoardItemMovementLog",
  "type": "cards:ticket"
}
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
