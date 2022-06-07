---
id: events
title: Events
sidebar_label: Events
---

Event is the way to send arbitrary information to erxes then you can create segments based those information

---

## Registering events

Events are actions that are triggered by something your customer performs on your site or app. Every time the event occurs, a new record is created in the analytics database. Refer to the following instruction to create event-based segments.

#### Step 1: Copy the script

Copy the code below and paste it onto your website page body section.

```
   <script>
    (function() {
    var script = document.createElement('script');
    script.src = "http://localhost:3200/build/eventsWidget.bundle.js";
    script.async = true;
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
  })();

  </script>

```

Replace ```http://localhost:3200``` with your erxes domain

### Update customer properties.

There are 2 ways to determine customer

1. To use messenger script
Messenger script will create and cache customer then events will use that customer as a action owner
2. To use window.Erxes.identifyCustomer function
It must receive one of following paramaters
  ```window.Erxes.identifyCustomer({ email: 'email', phone: 098333, code: 'code; })```

Let's use messenger script. Updated script section must look like following

```
	<script>
		window.erxesSettings = {
			messenger: {
				brand_id: "7iaAob",
        email: 'email@gmail.com'
			},
		};

		(function () {
			var script = document.createElement('script');
			script.src = "http://localhost:3200/build/messengerWidget.bundle.js";
			script.async = true;
			var entry = document.getElementsByTagName('script')[0];
			entry.parentNode.insertBefore(script, entry);
		})();

		(function () {
			var script = document.createElement('script');
			script.src = "http://localhost:3200/build/eventsWidget.bundle.js";
			script.async = true;
			var entry = document.getElementsByTagName('script')[0];
			entry.parentNode.insertBefore(script, entry);
		})();

	</script>
```

Now let's add following code to the body section

```
	<button id="button1">Update basic fields</button>
	<button id="button2">Update custom properties</button>
	<button id="button3">Tracked data</button>

	<script>
		document.querySelector('#button1').addEventListener('click', function () {
			window.Erxes.updateCustomerProperties(
				[
					{ name: 'firstName', value: 'Bat' },
					{ name: 'lastName', value: 'Dorj' }
				]
			);
		});

		document.querySelector('#button2').addEventListener('click', function () {
			window.Erxes.updateCustomerProperties(
				[
					{ name: 'custom_field__custom-prop1', value: 'prop1' },
					{ name: 'custom_field__custom-prop2', value: 'prop2' }
				]
			);
		});

		document.querySelector('#button3').addEventListener('click', function () {
			window.Erxes.updateCustomerProperties(
				[
					{ name: 'companyType', value: 'industry' },
					{ name: 'plan', value: 'paid' }
				]
			);
		});
	</script>
```

Let's check the updates
![](https://erxes-docs.s3.us-west-2.amazonaws.com/events.png)

- We have custom properties with codes custom-prop1, custom-prop2. To update the custom properties value we passed properties names with the prefix custom_field__

- If field name is not basic field or not custom property then it will be registered as tracked data.