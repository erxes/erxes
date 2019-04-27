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
```