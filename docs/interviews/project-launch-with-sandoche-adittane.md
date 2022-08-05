---
slug: project-launch-with-sandoche-adittane
title: All Things Open Source and Preparing for a Project Launch with Sandoche Adittane
author: Indra Ganzorig
author_title: Senior Product Marketing Manager at Erxes Inc
author_image_url: https://erxes.io/static/images/team/square/indra.png
tags: [cryptocurrency, open source, web development]
---

We had the opportunity to chat with [Sandoche Adittane](https://www.sandoche.com/) about his experiences building and promoting both open and closed source projects online. He has a lot of projects under his belt. You may know him as the creator of [darkmode.js](https://darkmodejs.learn.uno/) or most recently, as the maker of [Kanbanote](https://www.kanbanote.com/), Kanban boards for Evernote or [git.news](https://git.news/), a list of trending GitHub repos.

<!--truncate-->

Aside from open source projects, he also works on blockchain, full-stack web development and UI/UX design.

### The Interview

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/04/darkmode.png)

**Thank you for joining us today to talk about your involvement in the open-source space. Can you kick off the interview by telling us how you got involved in open source development? What was it about this space that pulled you in and never let you go?**

Five years ago, my phone was getting very old and slow, and I discovered a very cool (and ugly 😅) app made by a friend of mine. His app was called Summon beta, it was an alternative launcher for Android. Since I am both a designer and web developer I contacted my friend telling him that his launcher was good in performance and lightweight but it was very ugly and with my help, we could create a new one with a better UI and UX, and keeping the best of the old one: its performance and its size.

My friend was thrilled about the idea and ready to go for it, but he told me he would like it to be open source. At first, I was a bit against it 🤑. Until then I had never really built anything open source, I didn’t know what open source was and I didn’t even know people could contribute. For me it was just a way to make it free, and let people copy our code, and basically not making any money, like giving our time without asking anything in return.

After the app, [KISS Launcher](https://kisslauncher.com/) was developed and released we realized that users really liked it (we received a lot of good feedback), and even better, people started to contribute: first by adding new translations and then by even adding new features ! That’s how I understood what open source was about.

In the following years, I had to level up my skills and I used more and more open source libraries, especially in frontend development where frameworks grow like mushrooms. To keep up with this and also with other topics I wanted to learn, I started a challenge with myself. To learn a topic every month, build a project and write a post about it. I called it the Learning Lab challenge. You can learn more about it here. The website is also open source. That’s where I really started building open source stuff. Most of the projects built were purely for learning, so putting them open-source would let others use it and also learn from it 🙂.

**To date, what’s your biggest open source project and why do you think it gained the most traction?**

My biggest open source project (which is pretty small in terms of lines of code) is [Darkmode.js](https://darkmodejs.learn.uno/) a widget to add a dark mode 🌓 to your website in a second.

It currently has +1700 stars on GitHub. I think the reason it gained the most traction was the timing. I released at the beginning of the hype of dark-modes, a few months before Apple implemented it on their devices. Unlike iOS apps, where the app can be automatically turned to dark mode, in the web you need some active development to create a dark theme and my widget uses a CSS hack to have a quick way to make it happen (it usually needs some extra code to make your website perfect though).

**What’s the open-source project you’ve worked on that you’re most proud of? What is it about this project that makes you proud?**.

t’s a hard question, I am very proud of Darkmode.js mostly because it was a big success, but not so much from a technical point of view, even though I used a smart trick to turn pages to dark! Therefore I would say [Detoxify](http://www.detoxify.app/)

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/05/undraw_mobile_apps_spmp-300x225.png)

Detoxify is a mobile web app that generates a fake app to replace any addictive app 📱🙅. I am very proud of this project for a few reasons.

First, it tackles a very noble cause, yet not trending, smartphone apps and social media addictions! Which in my opinion will be a real problem in a few years!

Second, technically, it was a challenge: I needed to have the website’s fake app installable, and that was easily feasible by using the Progressive Web App but also having a maximum number of apps in my store. I initially thought about having a limited number of apps and let people contribute to the app to add other apps they wanted to detox for. But I found a better way: using an open-source library that fetched data from Google Play! Also thanks to this library, I didn’t have to host any logo or data related to any app which could go against copyright infringements! Moreover, even if one company asks me to delete the website, because it is open source it will never be fully stoppable, this repository has been forked and users can deploy detoxify on their own Heroku instance in one click 😎! The goal was to make it unstoppable, against the giants (GAFAM).

Last but not least, what also makes me proud about Detoxify is that I really started to hate the type of social media that turns people into zombies, they sometimes don’t even know when you talk to them! Don’t get me wrong I still have my social accounts, I didn’t stop using them, I just use them with moderation. Except for WhatsApp that I will delete my account from. They recently made me delete one of my apps called WhatsBlast 😢 and they didn’t let me put it open source (and I regret now not having put it open source from the beginning).

**Can you tell us a little bit more about the timeframe it takes you to develop an open-source project? What’s the time range it takes you to develop most of your MVPs?**

It depends, but since last year, I try to work mainly on short projects, so I don’t get bored or I don’t hate the idea I am working on after a few weeks. The way I do it is to usually take 1 to 4 hours to build a Proof of Concept or at least check if what I want to build is technically feasible. Then once I see that it is feasible I start with the framework/boilerplate that fits the best and I code the full project. Usually, to reach the MVP it will take 2 to 5 more days of work!

**When launching an open-source project do you use any type of launch framework/template to help you gain early traction? If so, can you give us a breakdown of how that framework looks?**

I use the same methodology for both open-source and closed source projects. What I basically do is to launch on Product Hunt, Hacker News, and Reddit.

Here is how I do:

## Project Launch Framework

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/04/undraw_progress_tracking_7hvk-300x234.png)

### Prep work

- Product Hunt:
  - Preparation of the tagline, text, tags, first comment
  - Create a gif
  - Schedule your launch at 00:00 California Time
  - Add a widget in your website to invite your users to upvote on PH, I made a widget for that.
- Reddit:
  - Finding the right subreddits where to post (depending on what is the project for)
  - In the worst case, you can always post on r/SideProjects
  - Except for the r/SideProjects subreddit, most of the subreddits are not there for promotion, so you should be very honest about your goal (like getting feedback, or finding contributors)
- Hacker News:
  - Just find a good tagline, very tech-oriented (no marketing BS)

### Launch day

Be sure your project is open source (I usually open before the launch, until then I leave it closed.)

- Product Hunt:
  - Post on Product Hunt (if you didn’t schedule)
  - Promote the launch on social networks
  - Promote the launch to my friends
  - Promote the launch in some startup groups
  - Answer fast the comments of the users
- Reddit:
  - Post where you were supposed to
- Hacker News:

  - Post putting “SHOW HN:” in front of the title, this shows that you are here showcasing your product, and better put the Github link instead of product hunt or website

  ![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/05/undraw_product_hunt_n3f5-300x244.png)

Then I just enjoy the day. 😎

**From a funding and monetization standpoint, how do you make your open source work sustainable? I see you have donation buttons on your projects. How much do donations contribute to the sustainability of your projects? On some projects, you also run ads. How have these worked for you?**

I do have a lot of donation buttons, but I do not get much from them. I got a maximum of 30 € from all my open source projects since I started open source 😂. So not enough to survive, so the only way is to have other projects (that are closed source) with a clear business model such as SaaS subscription or in-app purchase. Let’s say that my closed source project finances the open-source ones! I do also have some ads, in both my open and closed source projects, they bring in total (with all my websites between 25 and 45 € per month.)

**In your experience what have been the most successful monetization models, you’ve used?**

From all the monetization I have tried: SaaS recurring subscription is the best, then In app purchases, then google ads and finally donations. In open-source projects it’s hard to put a SaaS subscription in a lot of cases because anyone can create a free version of it, so I would say ads are what worked the best for open source projects.

**When exploring the monetization models of other open-source projects, what monetization models interest you most? What projects do you believe are doing a great job with respect to monetization?**

As I mentioned before, advertising is what works the best, then I think donation is also good when you have a website with users that come very often. In the start of one of my closed source project, Kanbanote, I didn’t have any SaaS revenue model, I only had a donation button, and it’s the project that raised the most in donations I guess (at least more than the 30 € I got with open-source projects 😂).

**Have you used Github’s new sponsorship program? If so, how has this worked out for you? If not, is this something you’ll consider taking advantage of? Why? Why not?**

I do want to use the Github sponsorship program, for that I need to have a clear goal to offer to my supporters, the same for my Patreon. My value proposition, in my opinion, is not good enough, not sexy enough. I planned to rethink it while reworking my portfolio website to have both of them more clear about my goals and explain better why people should support me 🙌.

**You do a lot of work in the blockchain space as well. Tell us a little bit more about the intersection where blockchain and open-source meet? Why does this intersection interest you and what projects are you working on in this space?**

I really like the blockchain philosophy, and more precisely the one of cryptocurrency that consists of not having a single entity in control. Our current world is very centralized (in any industry, there are always a few companies controlling the full market) and blockchain (and other decentralized ledger technologies), cryptocurrency, open source… Help giving back the power to the people!

![Alt text](https://erxes.io/blog_wp/wp-content/uploads/2020/05/undraw_crypto_portfolio_2jy5-300x206.png)

I think you cannot be decentralized and not have your code opened. That’s why blockchain cannot live without open source. Also, blockchain is about trusting algorithms instead of a single entity, and to trust a blockchain you need to be able to read its code!

When I discovered blockchain, I really enjoyed learning about it, I found it fascinating. It was one of my learning challenges, a hard one, to understand how blockchains work and to build one. In the end, I released my own cryptocurrency: Motive, and I built a generator to help people to build blockchains like this one, that are forks of NXT. I didn’t maintain them a lot recently, only updated the version of the blockchain to be up to date.

These days I am not working on blockchain projects, but I have a new project in mind that combines Generative art & music, blockchain, and decentralized apps and it will be open-source of course 😀.

**Thank you for taking the time to chat with us today, Sandoche. We really appreciate it. Many of [our blog](https://erxes.io/blog/) readers will have many actionable takeaways from our conversation today.**

**To our blog readers, if you’d like to learn more about Sandoche and the many projects he manages, you can follow him on [his website](https://www.sandoche.com/), or head over to his [GitHub profile here](https://github.com/sandoche).**
