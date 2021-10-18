---
id: namecard
title: Name card
---

import { CardComponent } from "./namecard.js"

## Username

<p>Show username using <code>username</code> prop.</p>
<CardComponent type="username" username="Ariuka" />

## Full name

<p>Show full name using <code>fullName</code> prop.</p>
<CardComponent type="fullName" />

## Avatar size

<p>You can change avatar size with <code>avatarSize</code> prop.</p>
<CardComponent type="avatarSize" info={50} />

## User E-mail

<p>Show user e-mail using <code>email</code> prop.</p>
<CardComponent type="usermail" info="ariunzaya@gmail.com" />

## Second line

<p>Show second line using <code>secondLine</code> prop. </p>
<CardComponent type="secondLine" info="Intern" />

## API

<CardComponent type="APIcard" table={[
    ['fullName', 'string', 'Fullname object of user. If you have details and username, it will only show detail'],
    ['email', 'string', 'Email object of user'],
    ['secondLine', '', 'string', 'Line below the username or full name. You can write anything in the second line'],
    ['avatarSize', '', 'number', 'Avatar size of your name card']
]} />