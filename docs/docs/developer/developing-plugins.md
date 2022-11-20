---
id: developing-plugins
title: Create General Plugin
sidebar_label: Create General Plugin
---

With erxes, you can create your own plugins or extend the existing ones, which would help you to enhance your experience and increase your revenue by adding the value on your products/services or selling it on our **<a href="https://erxes.io/marketplace" target="_blank">our marketplace</a>**. This guideline will help you to develop your own plugins.

:::caution

- Before you start developing your own plugins, ensure there is no plugins with the same name or similar name in our marketplace that would bring any confusion as the name would be used many places starting from your `API`, `GraphQL`, `query`, `mutation`, etc.
- Name must be in small letters with no symbols and space in between.
- Name of All your `GraphQL` type, `query`, `mutation` must start with your plugin name.
- Names of your database collection also must start with your plugin name.
- Name of your **UIroutes** or `url`-s also must be start with you pluging name.

:::

## Installing erxes

---

Please go to **<a href="https://docs.erxes.io/docs/category/local-installation">the installation guideline</a>** to install erxes XOS, but no need to run the erxes with the same direction.

:::warning

We assume you've already installed erxes XOS on your device. Otherwise the guideline below would not work out properly. Please make sure you should be back after you install erxes XOS using **<a href="https://docs.erxes.io/docs/category/local-installation">the installation guideline</a>**.

:::

### Plugin API

Plugin development in API part requires the following software prerequisites to be already installed on your computer.

- **[Typescript](https://www.typescriptlang.org/)**
- **[GraphQL](https://graphql.org/graphql-js/)**
- **[Express.js](https://expressjs.com)**
- **[MongoDB](https://www.mongodb.com)**
- **[Redis](https://redis.io)**
- **[RabbitMQ](https://www.rabbitmq.com)**

### Plugin UI

Plugin development in UI part requires the following software prerequisites to be already installed on your computer.

- **[Typescript](https://www.typescriptlang.org/)**
- **[Webpack](https://webpack.js.org/)**
- **[ReactJS](https://reactjs.org)**

## Creating New Plugin

Each plugin is composed of two parts, `API` and `UI`

1. Create new folders for both using the following command.

```
cd erxes
yarn create-plugin
```

The command above starts CLI, prompting for few questions to create a new plugin as shown below. In this example we create plugin named document.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/create_plugin_cli.gif" width ="100%"alt="CLI screenshot"></img>

The example below is a new plugin, created from an example template, placed at the main navigation.

<img src="https://demo-erxes.s3.amazonaws.com/plugin2.png" width ="100%"alt="Default plugin example"></img>

Creating from an empty template will result in as shown below, as we give you the freedom and space to develop your own plugin on erxes.

<img src="https://demo-erxes.s3.amazonaws.com/plugin3.png" width ="100%"alt="Empty plugin example"></img>

### API file structure

After creating a plugin, the following files are generated automatically in your new plugin API. 

```
📦plugin-document-api
 ┣ 📂src
 ┃ ┣ 📂graphql
 ┃ ┃ ┣ 📂resolvers 
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ mutations.ts
 ┃ ┃ ┃ ┗ queries.ts
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┗ typeDefs.ts
 ┃ ┣ configs.ts
 ┃ ┣ messageBroker.ts
 ┃ ┗ models.ts
 ┣ .env.sample
 ┣ package.json
 ┗ tsconfig.json
 ```

#### Main files

Following files are generated automatically in plugin-[pluginName]-api/src.

##### configs.ts
This file contains main configuration of a plugin.


<details>
  <summary>Click to see configs.ts file: </summary>

  ```ts showLineNumbers
  // path: ./packages/plugin-[pluginName]-api/src/configs.ts 

  import typeDefs from './graphql/typeDefs';
  import resolvers from './graphql/resolvers';

  import { initBroker } from './messageBroker';

  export let mainDb;
  export let debug;
  export let graphqlPubsub;
  export let serviceDiscovery;

  export default {
    name: '[pluginName]',
    graphql: async sd => {
      serviceDiscovery = sd;

      return {
        typeDefs: await typeDefs(sd),
        resolvers: await resolvers(sd)
      };
    },

    apolloServerContext: async (context) => {
      return context;
    },

    onServerInit: async options => {
      mainDb = options.db;

      initBroker(options.messageBrokerClient);

      graphqlPubsub = options.pubsubClient;

      debug = options.debug;
    }
  }
```
</details>

##### messageBroker.ts

This file uses for connect with other plugins. You can see message broker functions from <a href="https://docs.erxes.io/docs/code-reference/api/common-functions#message-broker-functions" target="_blank">**Common functions**</a>.

<details>
  <summary>Click to see messageBroker.ts file: </summary>

  ```ts showLineNumbers

  // path: ./packages/plugin-[pluginName]-api/src/messageBroker.ts 

  import { ISendMessageArgs, sendMessage } from "@erxes/api-utils/src/core";
  import { serviceDiscovery } from "./configs";
  import { Documents } from "./models";

  let client;

  export const initBroker = async cl => {
    client = cl;

    const { consumeQueue, consumeRPCQueue } = client;

    consumeQueue('document:send', async ({ data }) => {
      Documents.send(data);

      return {
        status: 'success',
      };
    });

    consumeRPCQueue('document:find', async ({ data }) => {
      return {
        status: 'success',
        data: await Documents.find({})
      };
    });
  };


  export const sendCommonMessage = async (
    args: ISendMessageArgs & { serviceName: string }
  ) => {
    return sendMessage({
      serviceDiscovery,
      client,
      ...args
    });
  };

  export default function() {
    return client;
  }
```
</details>

#### GraphQL development

Inside `packages/plugin-<new_plugin>-api/src`, we have a <code>graphql</code> folder. The folder contains code related to GraphQL.

```
 📂src
 ┣ 📂graphql
 ┃ ┣ 📂resolvers 
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ mutations.ts
 ┃ ┃ ┗ queries.ts
 ┃ ┣ index.ts
 ┃ ┗ typeDefs.ts
```

##### GraphQL resolvers

Inside `/graphql/resolvers/mutations` GraphQL mutation codes. 

<details>
  <summary>Click to see mutation examples:</summary>

  ```ts showLineNumbers
import { Documents, Types } from '../../models';
import { IContext } from "@erxes/api-utils/src/types"

const documentMutations = {
  /**
   * Creates a new document
   */
  async documentsAdd(_root, doc, _context: IContext) {
    return Documents.createDocument(doc);
  },
  /**
   * Edits a new document
   */
  async documentsEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
    return Documents.updateDocument(_id, doc);
  },
  /**
   * Removes a single document
   */
  async documentsRemove(_root, { _id }, _context: IContext) {
    return Documents.removeDocument(_id);
  },

  /**
   * Creates a new type for document
   */
  async documentTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async documentTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async documentTypesEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
  return Types.updateType(_id, doc);
  }
};

export default documentMutations;
  ```

</details>

Inside `/graphql/resolvers/queries` folder contains GraphQL query codes. 

<details>
  <summary>Click to see query examples:</summary>

  ```ts showLineNumbers
  import { Documents, Types } from "../../models";
  import { IContext } from "@erxes/api-utils/src/types"

  const documentQueries = {
    documents(
      _root,
      {
        typeId
      },
      _context: IContext
    ) {

      const selector: any = {};

      if (typeId) {
        selector.typeId = typeId;
      }

      return Documents.find(selector).sort({ order: 1, name: 1 });
    },

    documentTypes(_root, _args, _context: IContext) {
      return Types.find({});
    },

    documentsTotalCount(_root, _args, _context: IContext) {
      return Documents.find({}).countDocuments();
    }
  };

  export default documentQueries;

  ```

</details>

##### GraphQL typeDefs
Inside `/graphql/typeDefs.ts` file contains GraphQL typeDefs. 

<details>
  <summary>Click to see typeDefs:</summary>

  ```ts showLineNumbers
  import { gql } from 'apollo-server-express';

  const types = `
    type Document {
      _id: String!
      name: String
      createdAt:Date
      expiryDate:Date
      checked:Boolean
      typeId: String
    
      currentType: DocumentType
    }

    type DocumentType {
      _id: String!
      name: String
    }
  `;

  const queries = `
    documents(typeId: String): [Document]
    documentTypes: [DocumentType]
    documentsTotalCount: Int
  `;

  const params = `
    name: String,
    expiryDate: Date,
    checked: Boolean,
    typeId:String
  `;

  const mutations = `
    documentsAdd(${params}): Document
    documentsRemove(_id: String!): JSON
    documentsEdit(_id:String!, ${params}): Document
    documentTypesAdd(name:String):DocumentType
    documentTypesRemove(_id: String!):JSON
    documentTypesEdit(_id: String!, name:String): DocumentType
  `;


  const typeDefs = async _serviceDiscovery => {
    return gql`
      scalar JSON
      scalar Date

      ${types}
      
      extend type Query {
        ${queries}
      }
      
      extend type Mutation {
        ${mutations}
      }
    `;
  };

  export default typeDefs;

  ```
</details>


#### Database development

Inside `packages/plugin-<new_plugin>-api/src`, we have a <code>models</code> file. The file contains code related to MongoDB and mongoose.

```
📂src
┗ models.ts
```


##### Mongoose schema and model

Inside `src/models.ts`, file contains Mongoose schema and models.

<details>
  <summary>Click to see Mongoose schema and model example:</summary>

  ```ts showLineNumbers

  import * as _ from 'underscore';
  import { model } from 'mongoose';
  import { Schema } from 'mongoose';

  export const typeSchema = new Schema({
    name: String
  });

  export const documentSchema = new Schema({
    name: String,
    createdAt: Date,
    expiryDate: Date,
    checked: Boolean,
    typeId: String
  });

  export const loadTypeClass = () => {
    class Type {
      public static async getType(_id: string) {
        const type = await Types.findOne({ _id });

        if (!type) {
          throw new Error('Type not found');
        }

        return type;
      }
      // create type
      public static async createType(doc) {
        return Types.create({ ...doc });
      }
      // remove type
      public static async removeType(_id: string) {
        return Types.deleteOne({ _id });
      }

      public static async updateType(_id: string, doc) {
        return Types.updateOne({ _id }, { $set: { ...doc } });
      }
    }

    typeSchema.loadClass(Type);
    return typeSchema;
  };

  export const loadDocumentClass = () => {
    class Document {
      public static async getDocument(_id: string) {
        const document = await Documents.findOne({ _id });

        if (!document) {
          throw new Error('Document not found');
        }

        return document;
      }

      // create
      public static async createDocument(doc) {
        return Documents.create({
          ...doc,
          createdAt: new Date()
        });
      }
      // update
      public static async updateDocument (_id: string, doc) {
        await Documents.updateOne(
          { _id },
          { $set: { ...doc } }
        ).then(err => console.error(err));
      }
      // remove
      public static async removeDocument(_id: string) {
        return Documents.deleteOne({ _id });
      }
    }

  documentSchema.loadClass(Document);

  return documentSchema;
  };

  loadDocumentClass();
  loadTypeClass();

  // tslint:disable-next-line
  export const Types = model<any, any>(
    'document_types',
    typeSchema
  );

  // tslint:disable-next-line
  export const Documents = model<any, any>('documents', documentSchema);


  ```
</details>



### UI file structure

After creating new plugin using `yarn-create-plugin` command, the following files are generated automatically in your new plugin UI. 

```
📦plugin-[pluginName]-ui
 ┣ 📂src
 ┃ ┣ 📂components
 ┃ ┃ ┣ Form.tsx
 ┃ ┃ ┣ List.tsx
 ┃ ┃ ┣ Row.tsx
 ┃ ┃ ┣ SideBar.tsx
 ┃ ┃ ┗ TypeForm.tsx
 ┃ ┣ 📂containers
 ┃ ┃ ┣ List.tsx
 ┃ ┃ ┗ SideBarList.tsx
 ┃ ┣ 📂graphql
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ mutations.ts
 ┃ ┃ ┗ queries.ts
 ┃ ┣ App.tsx
 ┃ ┣ configs.js
 ┃ ┣ generalRoutes.tsx
 ┃ ┣ index.js
 ┃ ┣ routes.tsx
 ┃ ┗ types.ts
```

#### Main files
Following files are generated automatically in `plugin-[pluginName]-ui/src`.

##### configs.js

Following file contains the main configs of plugin.

<details>
  <summary>Click to see configs.js file: </summary>

  ```ts showLineNumbers
    // path: ./packages/plugin-[pluginName]-ui/src/configs.js 

    module.exports = {
      name: '[pluginName]',
      port: 3017,
      scope: '[pluginName]',
      exposes: {
        './routes': './src/routes.tsx'
      },
      routes: {
        url: 'http://localhost:3017/remoteEntry.js',
        scope: '[pluginName]',
        module: './routes'
      },
      menus:[
          {
            "text":"[pluginName]",
            "url":"/[pluginUrl]",
            "icon":"icon-star",
            "location":"[mainNavigation or settings]"
          }
        ]
    };
  ```

</details>

##### routes.tsx

Following file contains routes of plugin UI.

<details>
  <summary>Click to see routes.tsx file: </summary>

  ```ts showLineNumbers
    // path: ./packages/plugin-[pluginName]-ui/src/routes.tsx 

    import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
    import queryString from 'query-string';
    import React from 'react';
    import { Route } from 'react-router-dom';

    const List = asyncComponent(() =>
      import(/* webpackChunkName: "List - Documents" */ './containers/List')
    );

    const documents = ({ location, history }) => {
      const queryParams = queryString.parse(location.search);
      const { type } = queryParams;

      return <List typeId={type} history={history} />;
    };

    const routes = () => {
      return <Route path="/documents/" component={documents} />;
    };

    export default routes;

  ```
</details>

##### App.tsx

This file contains main component of application.

<details>
  <summary>Click to see App.tsx file:</summary>

  ```ts showLineNumbers
    // path: ./packages/plugin-[pluginName]-ui/src/App.tsx 

    import React from 'react';
    import GeneralRoutes from './generalRoutes';
    import { PluginLayout } from '@erxes/ui/src/styles/main';

    const App = () => {
      return (
        <PluginLayout>
          <GeneralRoutes />
        </PluginLayout>
      );
    };

    export default App;

  ```
</details>

#### UI development

##### Components
Inside `.src` folder, we have a components folder. The folder contains main components of plugin.

```
 📂src
 ┣ 📂components
 ┃ ┣ Form.tsx
 ┃ ┣ List.tsx
 ┃ ┣ Row.tsx
 ┃ ┣ SideBar.tsx
 ┃ ┗ TypeForm.tsx
```

<details>
  <summary>Click to see components example: </summary>

  ```ts showLineNumbers
    // path: ./packages/plugin-[pluginName]-ui/src/components/TypeForm.tsx 

    import { __ } from '@erxes/ui/src/utils/core';
    import React from 'react';
    import { IType } from '../types';
    import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
    import Form from '@erxes/ui/src/components/form/Form';
    import {
      ControlLabel,
      FormControl,
      FormGroup
    } from '@erxes/ui/src/components/form';
    import Button from '@erxes/ui/src/components/Button';
    import { ModalFooter } from '@erxes/ui/src/styles/main';

    type Props = {
      renderButton: (props: IButtonMutateProps) => JSX.Element;
      closeModal?: () => void;
      afterSave?: () => void;
      remove?: (type: IType) => void;
      types?: IType[];
      type: IType;
    };

    const TypeForm = (props: Props) => {
      const { type, closeModal, renderButton, afterSave } = props;

      const generateDoc = (values: {
        _id?: string;
        name: string;
        content: string;
      }) => {
        const finalValues = values;

        const { type } = props;

        if (type) {
          finalValues._id = type._id;
        }

        return {
          ...finalValues
        };
      };

      const renderContent = (formProps: IFormProps) => {
        const { values, isSubmitted } = formProps;

        const object = type || ({} as any);
        return (
          <>
            <FormGroup>
              <ControlLabel required={true}>Todo Type</ControlLabel>
              <FormControl
                {...formProps}
                name='name'
                defaultValue={object.name}
                type='text'
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <ModalFooter id={'AddTypeButtons'}>
              <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
                Cancel
              </Button>

              {renderButton({
                passedName: 'type',
                values: generateDoc(values),
                isSubmitted,
                callback: closeModal || afterSave,
                object: type
              })}
            </ModalFooter>
          </>
        );
      };

      return <Form renderContent={renderContent} />;
    };

    export default TypeForm;
  ```
</details>

##### Containers
Inside `.src` folder, we have a containers folder. The folder contains a component that contains codes related to API.

```
  📂src
  ┣ 📂containers
  ┃ ┣ List.tsx
  ┃ ┗ SideBarList.tsx
```

<details>
  <summary>Click to see containers example:</summary>

  ```ts showLineNumbers
    // path: ./packages/plugin-[pluginName]-ui/src/containers/SideBarList.tsx 

    import gql from 'graphql-tag';
    import * as compose from 'lodash.flowright';
    import { graphql } from 'react-apollo';
    import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
    import SideBar from '../components/SideBar';
    import {
      EditTypeMutationResponse,
      RemoveTypeMutationResponse,
      TypeQueryResponse
    } from '../types';
    import { mutations, queries } from '../graphql';
    import React from 'react';
    import { IButtonMutateProps } from '@erxes/ui/src/types';
    import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
    import Spinner from '@erxes/ui/src/components/Spinner';

    type Props = {
      history: any;
      currentTypeId?: string;
    };

    type FinalProps = {
      listTemplateTypeQuery: TypeQueryResponse;
    } & Props &
      RemoveTypeMutationResponse &
      EditTypeMutationResponse;

    const TypesListContainer = (props: FinalProps) => {
      const { listTemplateTypeQuery, typesEdit, typesRemove, history } = props;

      if (listTemplateTypeQuery.loading) {
        return <Spinner />;
      }

      // calls gql mutation for edit/add type
      const renderButton = ({
        passedName,
        values,
        isSubmitted,
        callback,
        object
      }: IButtonMutateProps) => {
        return (
          <ButtonMutate
            mutation={object ? mutations.editType : mutations.addType}
            variables={values}
            callback={callback}
            isSubmitted={isSubmitted}
            type="submit"
            successMessage={`You successfully ${
              object ? 'updated' : 'added'
            } a ${passedName}`}
            refetchQueries={['listTemplateTypeQuery']}
          />
        );
      };

      const remove = type => {
        confirm('You are about to delete the item. Are you sure? ')
          .then(() => {
            typesRemove({ variables: { _id: type._id } })
              .then(() => {
                Alert.success('Successfully deleted an item');
              })
              .catch(e => Alert.error(e.message));
          })
          .catch(e => Alert.error(e.message));
      };

      const updatedProps = {
        ...props,
        types: listTemplateTypeQuery.templateTypes || [],
        loading: listTemplateTypeQuery.loading,
        remove,
        renderButton
      };

      return <SideBar {...updatedProps} />;
    };

    export default withProps<Props>(
      compose(
        graphql(gql(queries.listTemplateTypes), {
          name: 'listTemplateTypeQuery',
          options: () => ({
            fetchPolicy: 'network-only'
          })
        }),
        graphql(gql(mutations.removeType), {
          name: 'typesRemove',
          options: () => ({
            refetchQueries: ['listTemplateTypeQuery']
          })
        })
      )(TypesListContainer)
    );
  ```
</details>


##### GraphQL

Inside `.src` folder, we have a `graphql` folder. The folder contains code related to GraphQL.

```
 📂src
 ┣ 📂graphql
 ┃ ┣ index.ts
 ┃ ┣ mutations.ts
 ┃ ┗ queries.ts
```


Inside `/graphql/mutations.ts` GraphQL mutation codes. 

<details>
  <summary>Click to see GraphQL mutation examples: </summary>

  ```ts showLineNumbers

  const add = `
    mutation documentsAdd($name: String!, $expiryDate: Date, $typeId:String) {
      documentsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
        name
        _id
        expiryDate
        typeId
      }
    }
  `;

  const remove = `
    mutation documentsRemove($_id: String!){
      documentsRemove(_id: $_id)
    }
    `;

  const edit = `
    mutation documentsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
      documentsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
        _id
      }
    }
    `;

  const addType = `
    mutation typesAdd($name: String!){
      documentTypesAdd(name:$name){
        name
        _id
      }
    }
    `;

  const removeType = `
    mutation typesRemove($_id:String!){
      documentTypesRemove(_id:$_id)
    }
  `;

  const editType = `
    mutation typesEdit($_id: String!, $name:String){
      documentTypesEdit(_id: $_id, name: $name){
        _id
      }
    }
  `;

  export default {
    add,
    remove,
    edit,
    addType,
    removeType,
    editType
  };

  ```


</details>


Inside `/graphql/queries.ts` GraphQL query codes. 

<details>
  <summary>Click to see GraphQL query examples: </summary>

  ```ts showLineNumbers

  const list = `
    query listQuery($typeId: String) {
      documents(typeId: $typeId) {
        _id
        name
        expiryDate
        createdAt
        checked
        typeId
        currentType{
          _id
          name
        }
      }
    }
  `;

  const listDocumentTypes = `
    query listDocumentTypeQuery{
      documentTypes{
        _id
        name
      }
    }
  `;

  const totalCount = `
    query documentsTotalCount{
      documentsTotalCount
    }
  `;

  export default {
    list,
    totalCount,
    listDocumentTypes
  };

  ```
</details>



## Configuring UI

---

### Running port for plugin

Inside `packages/plugin-<new_plugin>-ui/src/configs.js`, running port for plugin UI is set as shown below. Default value is 3017. Please note that each plugin has to have its UI running on an unique port. You may need to change the port manually (inside `configs.js`) if developing multiple plugins.

```js
module.exports = {
  name: 'new_plugin',
  port: 3017,
  scope: 'new_plugin',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'new_plugin',
    module: './routes'
  },
  menus: []
};
```

### Location for plugin

Inside `packages/plugin-<new_plugin>-ui/src/configs.js`, we have a configuration section. The example below places new plugin at the main navigation menu.

```js
menus: [
  {
    text: 'New plugin',
    url: '/new_plugins',
    icon: 'icon-star',
    location: 'mainNavigation',
  }
]
```

If you want to place it only inside settings, example is illustrated below.

```js
menus: [
  {
    text: 'New plugin',
    to: '/new_plugins',
    image: '/images/icons/erxes-18.svg',
    location: 'settings',
    scope: 'new_plugin'
  }
]
```

### Enabling plugins

"plugins" section inside `cli/configs.json` contains plugin names that run when erxes starts. Please note to configure this section if you decide to enable other plugins, remove or recreate plugins.

```json
{
 "jwt_token_secret": "token",
 "dashboard": {},
 "client_portal_domains": "",
 "elasticsearch": {},
 "redis": {
   "password": ""
 },
 "mongo": {
   "username": "",
   "password": ""
 },
 "rabbitmq": {
   "cookie": "",
   "user": "",
   "pass": "",
   "vhost": ""
 },
 "plugins": [
   {
     "name": "logs"
   },
   {
     "name": "new_plugin",
     "ui": "local"
   }
 ]
}

```

## Running erxes

---

Please note that `create-plugin` command automatically adds a new line inside `cli/configs.json`, as well as installs the dependencies necessary.

```json
{
	"jwt_token_secret": "token",
	"client_portal_domains": "",
	"elasticsearch": {},
	"redis": {
		"password": "pass"
	},
	"mongo": {
		"username": "",
		"password": ""
	},
	"rabbitmq": {
		"cookie": "",
		"user": "",
		"pass": "",
		"vhost": ""
	},
	"plugins": [
      {
        "name": "new_plugin",
        "ui": "local"
      }
	]
}
```

2. Run the following command

```
cd erxes/cli
yarn install
```

3. Then run the following command to start erxes with your newly installed plugin

```
./bin/erxes.js dev
```


<!-- ### Installing dependencies using home brew

1. `redis`

````

brew update
brew install redis
brew services start redis

```

2. `rabbitmq`

```

brew update
brew install rabbitmq
brew services start rabbitmq

```

3. `mongodb`

```

brew tap mongodb/brew
brew update
brew install mongodb-community@5.0
brew services start mongodb-community@5.0

```

Here you have everything in hand to develop your own plugins. If you still have questions, please contact us through **<a href="https://github.com/erxes/erxes/discussionsGithub" target="_blank">our community discussion</a>** or start conversation on **<a href="https://discord.com/invite/aaGzy3gQK5" target="_blank" target="_blank">Discord</a>**! We are happy to help 🤗🤗🤗
```
```` -->
