---
id: common-functions
title: Common functions
sidebar_label: Common functions
---


### Message Broker

The following <code>sendMessage</code> function used when work with the associated plugin.

`SendCommonMessage` function will send message to the other service with the following parameters:

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>serviceName</code>
      </td>
      <td>
        Message receiving service name. <code>i.e. plugin name.</code>
      </td>
      <td>
        <code>String</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>action</code>
      </td>
      <td>
        Action of the message.
      </td>
      <td>
        <code>String</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>data</code>
      </td>
      <td>
        Passing data.
      </td>
      <td>
        <code>Object</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>isRPC</code>
      </td>
      <td>
        Message type, if it's true message will return value.
      </td>
      <td>
        <code>Boolean</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>timeout</code>
      </td>
      <td>
        The time limit for waiting for a response from a message.
      </td>
      <td>
        <code>Number</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>defaultValue</code>
      </td>
      <td>
        Default return value if an error occurs while sending the message.
      </td>
      <td>
        <code>any</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>serviceDiscovery</code>
      </td>
      <td>
        Service discovery contains services information such as service isEnabled 
      </td>
      <td>
        <code>String</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>subdomain</code>
      </td>
      <td>
        subdomain uses for Erxes saas version. When you developing open source plugin you can pass 'os' as a parameter. 
      </td>
      <td>
        <code>String</code>
      </td>
    </tr>
  </tbody>
</table>

```ts showLineNumbers
export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

// We can pass default serviceName parameter and can be used by giving the name of the server.
export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};
```

Messagebroker contains two consumer functions `consumeQueue` & `consumeRPCQueue`. Difference between them is `consumeRPCQueue` returns a value, while `consumeQueue` doesn't.

`consumeQueue, consumeRPCQueue` function will receive message from the other service with the following parameters:

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>name</code>
      </td>
      <td>
        The name of the message receiving queue. Name has the following format <code>serviceName:actionName</code>
      </td>
      <td>
        <code>String</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>data</code>
      </td>
      <td>
        The data of the message being sent by the service.
      </td>
      <td>
        <code>String</code>
      </td>
    </tr>
  </tbody>
</table>
