---
id: choose-your-plugins
title: Choose your plugins
sidebar_label: Choose your plugins
---

erxes has a set of plugins that allow you to create unique customer experiences. Go to our <a href="https://erxes.io/marketplace" target="_blank">marketplace</a> to find out what plugins erxes offers you and their use cases.

:::important

- Plugin is the feature that can work independently on XOS  to fulfill the particular purpose of enterprises/developers, such as sales pipeline, delivery, etc. 
- XOS Core plugins developed by the erxes Inc team will play the main role for optional plugins to work together. 
- Addons are the sub-features that work with particular plugins only to enhance the experience of plugins.  

:::

## Preparing the installation
---

1. Before installing plugins, ensure you have installed and had access to your erxes project.  If you haven’t done it yet, please go to <a href="https://www.erxes.org/developer/ubuntu" target="_blank">the erxes installation guide</a> to install erxes XOS. 
2. Switch to **the federation branch**.
3. Copy the plugins in the `erxes/cli/configs.json`.

## Installing plugins
---

1. In the terminal, go to erxes/cli directory by using `Cd erxes/cli` command.  
            
2. Ensure if you have configs.json file using `Ls -la` command.
             
3. If you don’t have configs.json file, create one by running `Cp configs.json.sample configs.json` command.

 
:::caution

Open Configs.json file in Editor from the following choices: `vscode`, `sublime`, `atom` etc.

:::

4. Open Configs.json file in code editor by code editor one of the following options:

- Open configs.json by using the code given within the guide.  
- Go to cli folder by choosing the File -> Open folder from Vscode. 
- Vim (optional)
- Nano (optional)

:::note

Name the plugins in the following format:   “name”: “products”, “name”: “sales pipeline” etc.
There are two options of installation within UI part. **Local** is used for development purposes, **Remote** is used for production.
If you choose **Remote** option to install, please add the following code in your cli.configs.json file. 

 ```"ui_remote_url": "https://office.erxes.io/js/plugins/plugin-<name>-ui/remoteEntry.js```

:::


5. Install the plugin with the following format.            

```
{
                “name”: “products”,
                “ui”: “local”
            }
```

:::info

Some plugins have only plugin API with no UI, so ensure what plugins you want to install from erxes/packages beforehand.

:::

6. Sample code of the above guidelines.

```
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
 "ui_remote_url": "https://office.erxes.io/js/plugins/plugin-<name>-ui/remoteEntry.js",
 "plugins": [
   {
     "name": "logs"
   },
   {
     "name": "products",
     "ui": "local"
   }
 ]
}
```

Go back to erxes/cli directory once you finished installing one plugin. 


:::note

All erxes plugins are located in the erxes/packages directory.

:::

7. To install each plugins, run the following command within the  UI of each plugin.
      
```
      Cd ../packages/plugin-products-ui
      Yarn install-deps
```

8. Run your erxes project by going to your new erxes/cli directory with the following command.

```
/bin/erxes.js dev
```


