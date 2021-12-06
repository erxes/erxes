---
id: namecard
title: Name card
---

import { CardComponent } from "./namecard.js"

## Username

<p>Show username using <code>username</code> prop.</p>
<CardComponent type="username" name="james" />

## Full name

<p>Show full name using <code>fullName</code> prop.</p>
<CardComponent type="fullName" name="James Smith" />

## Avatar size

<p>You can change avatar size with <code>avatarSize</code> prop.</p>
<CardComponent type="avatarSize" name="James Smith" info={50} />

## User E-mail

<p>Show user e-mail using <code>email</code> prop.</p>
<CardComponent type="usermail" name="James Smith" mail="jamessmith@gmail.com" />

## Single Line

<p>Make the secondLine invisible with <code>singleLine</code> prop.</p>
<CardComponent type="singleLine" name="James Smith" mail="jamessmith@gmail.com" info={true} />

## Second line

<p>Show second line using <code>secondLine</code> prop. </p>
<CardComponent type="secondLine" name="James Smith" info="Intern" />

## API

<CardComponent type="APIcard" />
