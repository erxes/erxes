---
slug: increasing-growth-by-building-community
title: Increasing Growth by Building a Community with Norbert Sendetzky
author: MJ Amartaivan
author_title: Co-Founder and CEO at Erxes Inc
author_image_url: https://erxes.io/static/images/team/square/mend-orshikh.jpg
tags: [open source, education]
---

At erxes, we’re dedicated to supporting open source projects grow. We do this in a couple of different ways. First, we help open source projects grow through the use of our own [own open source marketing platform](https://erxes.io/). Secondly, we work hard to educate open source project founders and contributors on a wide range of topics relating to marketing open source projects.

<!--truncate-->

From time to time, we interview leaders in the open source space for our blog, about their experiences managing and scaling their projects.

Today, Erxes had the opportunity to chat with Norbert Sendetzky from [Aimeos](https://aimeos.org/), to talk about Aimeos’s growth so far.

Let’s jump in and learn about the journey!

### The Interview

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/02/norbert.png)

**Hi and thank you for taking the time out of your day to chat with us today about Aimeos. Can you help us kick off this interview by telling us a little bit more about how Aimeos came into existence?**

In my former company, we built the European Tassimo online shops for Kraft Foods in 2006 and none of the existing solutions were a good choice for the project. It was the time of standalone shop systems and they were not designed to be integrated into other systems.

Kraft Foods Europe used a proprietary Java-based content management system (CMS) for all their sites and they needed an e-commerce solution which was fast and which could be integrated into their CMS via an API. This was the birth of the predecessor of Aimeos and one of the first API based e-commerce systems – almost 10 years before the API hype started.

The system has improved, had been rewritten and stabilized over time, so we wrote an integration for another popular CMS in Europe named TYPO3. Our library based approach made integration very easy and we’ve used that CMS and our e-commerce framework in various customer projects. In 2012, we finally decided to make it available as Open Source.

In late 2014, my former company stopped development and the original code base had been forked by a group of enthusiasts. This was the start of the community driven Aimeos project of today. Since then, the number of commits for Aimeos exploded and contributors implemented integrations for Symfony, Laravel and other PHP frameworks.

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/03/download-1024x1024.jpeg)

Especially the Laravel integration was a great success because Laravel was the upcoming PHP framework at that time without a full featured e-commerce package. Today, Aimeos is still the most feature rich and most popular e-commerce system for Laravel and it’s the only one supporting the latest Laravel 6 at the moment.

**Why was the decision made to make Aimeos open source? What were the main decisions / options you were weighing in your head before making the final decision?**

I’ve been using Open Source software since my time at university and for me it was always clear that software should be Open Source to be successful. Especially, if you don’t have big budgets for marketing and sales, releasing software as Open Source is extremely important to gain popularity and market share.

Internally, we’ve discussed several options for the Open Source license because that choice has a great impact on how you can make money to make a living. When using the GPL, you can only sell support and custom implementation because you are not allowed to write proprietary code based on GPL code. A BSD-like license allows that too, but everybody else can use it without the need to give something back. And AGPL is quite the opposite: You have to give everything back even if you are only using it on your own.

In the end, we decided to use the LGPL license. It only requires that you give back modifications to the Aimeos core if you redistribute it while it allows everyone to implement commercial extensions to make their living. And contrary to the AGPL, it doesn’t restrain people from using it.

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/03/icons-15-150x150.png)

**Let’s talk about open source projects in general for a moment. In your opinion, what are some of the most exciting advancements you’re seeing in the open source community at the moment?**.

In terms of software, Javascript-based applications gained a lot of traction in the last few years due to browser support and the Node.js framework.

Running the frontend JS on the server is great for all the frontend developers who can write ultra fast, universal progressive web applications (PWA) while using the Aimeos JSON:API for the backend and complex business logic.

My favorite JS framework at the moment is Vue.js because you can use the parts you need instead of an all or nothing approach. Also, it has a great community that created projects like nuxt.js that eases development a lot.

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/03/icons-01-150x150.png)

**Similarly, how are you seeing open source projects approach the issue of monetization. What are some interesting models you’re seeing used in this space, and how are you approaching monetization within Aimeos?**

The classic approach is to create new features for customers and sell support. Depending on the license, you can sell proprietary extensions too. If the project is big enough, their creators can also write books and offer trainings for developers. Taylor Otwell, the creator of Laravel built a whole ecosystem around Laravel with Vapor, Forge and Envoyer. If you can drive potential customers to partners, they are also willing to pay for that status.

At Aimeos, we offer custom implementation, developer support and training as well as extended long term support for companies which want to run their Aimeos installation save over several years without the need to update to a new major version. We also have a few commercial extensions that are required for B2B setups and big installations. We want to grow our partner network in the next few months and participate on their success with Aimeos.

**You have a lot of really great examples of sites built using Aimeos. Tell us a little bit more about why a store would use Aimeos over other e-Commerce frameworks available on the market?**

Aimeos is unique among the e-commerce frameworks because of its library based approach. Contrary to other solutions, Aimeos can be natively integrated into any PHP application or framework and it almost feels like a native package. User management, sessions, configuration, templating and all other services of the application and framework are used. Only the native ORM stuff is not because it’s too slow for what we want to achieve with Aimeos.

For shop owners, Aimeos is the perfect fit if they need a custom product catalog, online shop, complex B2B solution or market place. They can choose what fits best for their needs and focus on speed when using one of the PHP frameworks or on content when they need a full-featured CMS system that allows to do real content commerce.

Aimeos is especially suited to build complex B2B portals, market places or reseller systems. Due to its extensible architecture which allows you to add own code dynamically by configuration, its easy to implement complex processes and rules e.g. for shipping options. Our marketplace extension not only enables you to build gigantic market places with separate shops for each vendor but also deeply structured reseller systems with inheritance of data from parent sites.

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/03/icons-06-150x150.png)

If you want to build really huge systems, you will love the Aimeos #gigacommerce extension which stores all product and stock data in ElasticSearch only and not as copy of a relational database. Thus, shops using that combination scale to one billion items and beyond without problems. To give you a comparison: Amazon only sells around 560 million items at the moment! There’s also a demo where you can see how fast an Aimeos shop with one billion items is: [https://aimeos.com/gigacommerce/](https://aimeos.com/gigacommerce/).

**What are some of your most successful growth channels (for gaining awareness and traffic), and why do you think that is? If you had to double down on one growth activity today, what would it be and why?**

For Aimeos, the Google search engine is still the most important source for growth due to the fact that everybody uses Google to find things they are looking for. I don’t see that this will change in the future. We also tried other channels for marketing like Facebook, Twitter, speaking at conferences and so on.

The success on Facebook is directly related to how much money you are going to spend because Open Source projects aren’t things that go viral. Optimizing your page for search engines is usually much cheaper. Twitter is the same as Facebook but lacks the possibility to limit ads to an exactly defined target group. Speaking at conferences is also great to wow the attendees but the number is always limited.

**What are some of the differences between open source and closed source projects when it comes to marketing. Do you believe one has an advantage over the other? Why?**

Absolutely, real Open Source projects have an advantage over closed source projects because anybody can try out the software and you get a solid user base much quicker. It’s easier to convince people to try your product if they can start without spending money for your software in the beginning. For closed source software, you have to do a lot of marketing and sales to get traction and that can get expensive.

**In your experience how much of a role do the developers who contribute to the project play in the marketing and promotion of the project? What are some of the biggest roadblocks you face when it comes to making the community around a project responsible for the project’s exposure as well? How can open source projects tackle this issue?**

There are two relevant points: Developers who are enthusiastic about a product, spread the word by themselves and they can convince their peers much easier to try the project than by marketing. Additionally, the more developers like a project and express that in some way, the more attractive it is for other developers. Usually, there’s a tipping point where growth starts to get a boost just by the number of developers already using the software.

Building a community can be hard at the beginning depending on the project. If there’s hype around a subject, it can be much easier and this is still the case for projects related to the big Javascript frameworks at the moment.

In general, people want to share their experience with projects if they really like them and if they have an interest themselves to push the subject. So it’s wise to let your users participate in the success of the project in some way. Open Source projects have more ways to do this and the most obvious is that developers can see their names in the repositories they contributed code to.

**From a growth standpoint, what are some open source projects you draw inspiration from? What projects are you aware of that are doing interesting things in terms of their approach to growth? What do you find their approaches unique or interesting?**

For me, Laravel and Vue.js are projects I’ve learned a lot from. They are totally focused on making things as easy as possible for developers and this has made the projects some of the most successful in their area, if you compare the likes at Github (even if React is still more often used in projects). Both are totally driven by their communities and this made them extremely successful.

**Lastly, if you could go back in time and give a younger version of yourself three pieces of advice on the topic of managing and growing an open source project, what would those three pieces of advice be?**

The most important: Release early! Perfection doesn’t give you an advantage if your competitors had several years for building a community in the meantime. People are using mostly their eyes, so it’s important to have a nice interface and demos. Make things as easy as possible. Developers and users need to understand the system and things should be easy to implement and work with.

**Thank you greatly for taking the time to chat with [Erxes](https://erxes.io/) today, Diana. We really appreciate it. Many of [our blog](https://erxes.io/blog/) readers are currently in the process of scaling their own open source projects, so insights like the ones you’ve provided above, can help them get from where they are to where they want to be.**

**To our blog readers, if you’d like to learn more about Aimeos, you can follow them on [GitHub](https://github.com/aimeos) or visit their [website here](https://aimeos.org/).**
