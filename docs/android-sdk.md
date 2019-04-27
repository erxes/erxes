---
id: android-sdk
title: Android SDK
sidebar_label: Android SDK
---

<!--Content-->


## Installation

### Installation with Gradle
1. Add the JitPack repository to your build file
Add it in your root build.gradle at the end of repositories:

```gradle
allprojects {
    repositories {
        ...
        maven { url 'https://jitpack.io' }
    }
}
```
2. Add the dependency
```
dependencies {
        implementation 'com.github.erxes:erxes-android-sdk:{latest-version}'
}
```
### Permissions

+ To enable file send and receiving feature you have to add the following code to the``` AndroidManifest.xml```
```
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Requirement

+ minSdkVersion is 14

## Usage

### Default configuration
+ brandCode - generated unique code of your brand
+ apiHost - erxes-widgets-api server url
+ subsHost - erxes-api subscription url
+ uploadUrl - erxes-api server url

```java
public class CustomActivity extends AppCompatActivity {
    Config config;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        config = new Config.Builder("brandid")
                .setApiHost("https://url/graphql")
                .setSubscriptionHost("wss://url/subscriptions")
                .setUploadHost("https://url/upload-file")
                .build(this);
    }
 }
```
### Start Erxes Sdk

+ Call a ErxesSdk with login form
```java
    config.Start();
```
+ following example user will log-in to erxes with email without login form

```java
    config.Start_login_email("example@email.com");
```
+ following example user will log-in to erxes with phoneNumber without login form
```java
    config.Start_login_email("phoneNumber");
```