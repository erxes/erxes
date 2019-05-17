---
id: ios-sdk
title: iOS SDK
sidebar_label: iOS SDK
---

<!--Content-->

## Requirement

+ Minimum deployment target : iOS 9.0
+ Swift 4 compatible
+ Objective-C compatible
+ brandCode - uniquely generated code for your brand which you can find in your messenger installation code

## Installation with Swift

Following configuration should be made in your AppDelegate.swift basic properties.

```
import ErxesSDK
```

##### For Open Source Version:
```
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
Erxes.setBrandCode(code: “brandCode”)
    Erxes.setHosts(apiHost: “https://erxes-widgets-api/graphql”,
            subsHost: "wss://erxes-api/subscriptions",
            uploadUrl: "https://erxes-api/upload-file")
 return true
}

```

##### For SaaS Version:
```
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
Erxes.setBrandCode(code: “brandCode”)
Erxes.setHosts(apiHost: “https://YourCompanyName.app.erxes.io/widgets-api/graphql”,
            subsHost: "wss://YourCompanyName.app.erxes.io/api/subscriptions",
            uploadUrl: "https://YourCompanyName.app.erxes.io/api/upload-file")
 return true
}

```

#### NEXT

##### To start erxes SDK in your app:
```
import ErxesSDK
```

##### This function will start erxes SDK with authentication options:
```
@ibaction func buttonAction(sender:Uibutton){
	Erxes.start()
}
```

##### If your application has already registered users following function will authenticate them automatically(in-app messaging):

##### By email address:
```
Erxes.startWithUserEmail(email: "email of user")
```

##### By phone number:
```
Erxes.startWithUserPhone(phone: "phone number of user")
```

##### If you intend to fetch some specific datas from users include following function:
```
var messengerData = [String:Any]()
messengerData["user data key"] = "user data value"
Erxes.start(email: "", phone: "", data: messengerData)
```
##### To end current user session:
```
 Erxes.endSession(completionHandler: {
            // do your stuff
        })

```
##### Or simply
```
Erxes.endSession()
```

## Installation with Objective-C

Following configuration should be made in your AppDelegate.m basic properties.

```
#import <ErxesSDK/ErxesSDK-Swift.h>
```

##### For Open Source Version:
```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    [Erxes setBrandCodeWithCode:@"brandCode"];
    [Erxes setHostsWithApiHost:@"https://erxes-widgets-api/graphql/graphql" subsHost:@"wss://erxes-api/subscriptions" 
uploadUrl:@"https://erxes-api/upload-file"];
    return YES;
}
```

##### For SaaS Version:
```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    [Erxes setBrandCodeWithCode:@"brandCode"];
    [Erxes setHostsWithApiHost:@"https://YourCompanyName.app.erxes.io/widgets-api/graphql" subsHost:@"wss://YourCompanyName.app.erxes.io/api/subscriptions" uploadUrl:@"https://YourCompanyName.app.erxes.io/api/upload-file"];
    return YES;
}
```

#### NEXT
##### To start erxes SDK in your app:
```
#import <ErxesSDK/ErxesSDK-Swift.h>
```

##### This function will start erxes SDK with authentication options:
```
- (IBAction)buttonAction:(id)sender {
    [Erxes start];
}
```

##### If your application has already registered users following function will authenticate them automatically(in-app messaging):
##### By email address:
```
[Erxes startWithUserEmailWithEmail:@"email of user"];
```
##### By phone number:
```
[Erxes startWithUserPhoneWithPhone:@"phone of user"];
```

##### If you intend to fetch some specific datas from users include following function:
```
NSMutableDictionary *messengerData = [[NSMutableDictionary alloc] init];
[messengerData setObject:@"what ever you want" forKey:@"user data"];
[Erxes startWithEmail:@"" phone:@"" data:messengerData];
```

##### To end current user session:
```
[Erxes endSessionWithCompletionHandler:^{
        // do your stuff
}];
```
<!-- 
## Installation with Swift
1. Add 'ErxesSdk' to your podfile and run pod install
```
target '<Your Target Name>' do
    pod 'ErxesSDK'
end
```
2. In your AppDelegate config basic properties of ErxesSDK
+ brandCode - generated unique code of your brand
+ apiHost - erxes-widgets-api server url
+ subsHost - erxes-api subscription url
+ uploadUrl - erxes-api server url
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    Erxes.setBrandCode(code: "YDEdKj")
    Erxes.setHosts(apiHost: "http://localhost:3100/graphql",
            subsHost: "ws://localhost:3300/subscriptions",
            uploadUrl: "http://localhost:3300/upload-file")
    return true
}
```

### Start Erxes Sdk

Just call this function inside your own trigger function
```
@IBAction func btnClick(){
    Erxes.start()
}
```
If your application has already registered user provide info with this function

```
@IBAction func btnClick(){
    var data = [String : Any]()
    data["firstName"] = "Altantgerel"
    data["lastName"] = "Purev-Yondon"
    Erxes.start(email: "purevyondon.a@nmma.co", phone: "88998899", data: data)
}
```

## Installation With Objective-C

Config basic properties of ErxesSDK in your AppDelegate

+ brandCode - generated unique code of your brand
+ apiHost - erxes-widgets-api server url
+ subsHost - erxes-api subscription url
+ uploadUrl - erxes-api server url

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Erxes setBrandCodeWithBrandCode:@"YDEdKj"];
    [Erxes setHostsWithApiHost:@"http://localhost:3100/graphql"
           subsHost:@"ws://localhost:3300/subscriptions" 
           uploadUrl: "http://localhost:3300/upload-file"];
    return YES;
}
```

### Start Erxes Sdk
Just call this function inside your own trigger function

```
- (IBAction)btnClick:(id)sender {
    [Erxes start];
}
```
If your application has already registered user provide info with this function
```
- (IBAction)btnClick:(id)sender {
    [Erxes startWithUserEmailWithEmail:@"test@test.com"];
}
``` -->