---
id: ios-sdk
title: iOS SDK
sidebar_label: iOS SDK
---

Learn how to install the iOS SDK.

<!--Content-->

## Requirement

- Minimum deployment target : iOS 9.0
- Swift 4 compatible
- Objective-C compatible

brandCode - uniquely generated code for your brand which you can find in your messenger installation code

## Installation with Swift

Following configuration should be made in your AppDelegate.swift.

```swift
import ErxesSDK
```

### For Open Source Version:

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    Erxes.setBrandCode(code: “brandCode”)
    Erxes.setHosts(apiHost: "https://erxes-widgets-api/graphql",
                  subsHost: "wss://erxes-api/subscriptions",
                 uploadUrl: "https://erxes-api/upload-file")
 return true
}
```

### For SaaS Version:

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
    Erxes.setBrandCode(code: “brandCode”)
    Erxes.setHosts(apiHost: "https://YourCompanyName.app.erxes.io/widgets-api/graphql",
                  subsHost: "wss://YourCompanyName.app.erxes.io/api/subscriptions",
                 uploadUrl: "https://YourCompanyName.app.erxes.io/api/upload-file")
 return true
}
```

#### NEXT

### To start Erxes SDK in your app:

```swift
import ErxesSDK
```

##### This function will start Erxes SDK with authentication options:

```swift
@ibaction func buttonAction(sender:Uibutton){
	Erxes.start()
}
```

##### If your application has already registered users following function will authenticate them automatically(in-app messaging):

##### By email address:

```swift
Erxes.startWithUserEmail(email: "email of user")
```

##### By phone number:

```swift
Erxes.startWithUserPhone(phone: "phone number of user")
```

##### If you intend to fetch some specific datas from users you can use following function:

```swift
var messengerData = [String:Any]()
messengerData["user data key"] = "user data value"
Erxes.start(email: "", phone: "", data: messengerData)
```

##### To end current user session:

```swift
 Erxes.endSession(completionHandler: {
            // do your stuff
})
```

##### Or simply

```swift
Erxes.endSession()
```

## Installation with Objective-C

Following configuration should be made in your AppDelegate.m basic properties.

```smalltalk
#import <ErxesSDK/ErxesSDK-Swift.h>
```

### For Open Source Version:

```smalltalk
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Erxes setBrandCodeWithCode:@"brandCode"];
    [Erxes setHostsWithApiHost:@"https://erxes-widgets-api/graphql/graphql"
                      subsHost:@"wss://erxes-api/subscriptions"
                     uploadUrl:@"https://erxes-api/upload-file"];
    return YES;
}
```

### For SaaS Version:

```smalltalk
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Erxes setBrandCodeWithCode:@"brandCode"];
    [Erxes setHostsWithApiHost:@"https://YourCompanyName.app.erxes.io/widgets-api/graphql"
                      subsHost:@"wss://YourCompanyName.app.erxes.io/api/subscriptions"
                     uploadUrl:@"https://YourCompanyName.app.erxes.io/api/upload-file"];
    return YES;
}
```

#### NEXT

### To start erxes SDK in your app:

```smalltalk
#import <ErxesSDK/ErxesSDK-Swift.h>
```

##### This function will start erxes SDK with authentication options:

```smalltalk
- (IBAction)buttonAction:(id)sender {
    [Erxes start];
}
```

##### If your application has already registered users following function will authenticate them automatically(in-app messaging):

##### By email address:

```smalltalk
[Erxes startWithUserEmailWithEmail:@"email of user"];
```

##### By phone number:

```smalltalk
[Erxes startWithUserPhoneWithPhone:@"phone of user"];
```

##### If you intend to fetch some specific datas from users include following function:

```smalltalk
NSMutableDictionary *messengerData = [[NSMutableDictionary alloc] init];
[messengerData setObject:@"what ever you want" forKey:@"user data"];
[Erxes startWithEmail:@"" phone:@"" data:messengerData];
```

##### To end current user session:

```smalltalk
[Erxes endSessionWithCompletionHandler:^{
        // do your stuff
}];
```

<!--Content-->
