---
id: namecard
title: Name card
---

import { CardComponent } from "./namecard.js"

## Username

<p>Show username using <code>username</code> prop.</p>
<CardComponent type="username" name="Ariuka"></CardComponent>

## Full name

<p>Show full name using <code>fullName</code> prop.</p>
<CardComponent type="fullName" name="Ariunzaya Enkhbayar"></CardComponent>

## Avatar size

<p>You can change avatar size with <code>avatarSize</code> prop.</p>
<CardComponent type="avatarSize" name="Ariunzaya Enkhbayar" info="50"></CardComponent>

## User E-mail

<p>Show user e-mail using <code>email</code> prop.</p>
<CardComponent type="usermail" name="Ariunzaya Enkhbayar" info="ariunzaya@gmail.com"></CardComponent>

## Second line

<p>Show second line using <code>secondLine</code> prop. </p>
<CardComponent type="secondLine" name="Ariunzaya Enkhbayar" info="Intern"></CardComponent>

## API

<CardComponent type="APIcard" table={[
    ['fullName', 'string', 'Fullname object of user. If you have details and username, it will only show detail'],
    ['email', 'string', 'Email object of user'],
    ['secondLine', '', 'string', 'Line below the username or full name. You can write anything in the second line'],
    ['avatarSize', '', 'number', 'Avatar size of your name card']
]}></CardComponent>