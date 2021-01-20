---
id: android-sdk
title: Android SDK
sidebar_label: Android SDK
---

<!--Content-->

These steps indicate how to install the Android SDK, for that you must follow the instructions explained below.

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
Click [here](https://github.com/erxes/erxes-android-sdk/releases) to show erxes-android-sdk latest version.
### Permissions

+ To enable file send and receiving feature you have to add the following code to the``` AndroidManifest.xml```
```
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature
    android:name="android.hardware.camera"
    android:required="true" />
```

### Requirement
+ minSdkVersion is 15
1. You must add the library in the app gradle:
```
implementation 'androidx.multidex:multidex:2.x.x'
```
2. After, add in the defaultConfig of the app gradle:
```
multiDexEnabled true
```


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
### Start Erxes SDK

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
```}

