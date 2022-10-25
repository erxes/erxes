---
id: developing-integration-plugins
title: Create Integration plugin
sidebar_label: Create Integration plugin
---

Integration is a kind of plugin that extends inbox plugin. Before reading this please checkout the <a href="https://docs.erxes.io/docs/developer/developing-plugins">Create plugin guide</a>. Since it extends inbox plugin you have to run inbox plugin before creating integration.

### UI specific configs

Each plugin is composed of two parts, `API` and `UI`

1. Create new folders for both using the following command.

```
cd erxes
yarn create-plugin
```

The command above starts CLI, prompting for few questions to create a new plugin as shown below.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/create-plugin.gif" width ="100%"alt="CLI screenshot"></img>

The example below is a new plugin, created from an example template, placed at the main navigation.

<img src="https://demo-erxes.s3.amazonaws.com/plugin2.png" width ="100%"alt="CLI screenshot"></img>

Creating from an empty template will result in as shown below, as we give you the freedom and space to develop your own plugin on erxes.

<img src="https://demo-erxes.s3.amazonaws.com/plugin3.png" width ="100%"alt="CLI screenshot"></img>