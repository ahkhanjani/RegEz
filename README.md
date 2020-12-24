# RegEz &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/blooak/regez/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/regez.svg?style=flat)](https://www.npmjs.com/package/regez)

RegEz is a RegEx generator for coding regular expressions in JavaScript.

## Installation

Using Yarn:

```bash
yarn add regez
```

Using NPM:

```bash
npm i regez
```

## Introduction

The goal is to create simple small blocks of RegEx and putting them together to create more complex RegExs, in a way more readable and understandable way.

We write all the RegEx using English and JavaScript syntax. Of course understanding the RegEx language is essential; But we will not write anything but pure English and JavaScript.

## Tutorial

As an example, we want to create a simple RegEx for email validation.

Consider an email address like this: `NAME@DOMAIN.EXT`.

Our rules for a valid email address are going to be:

**Note:** For a real life project, you need to add more rules to this example.

- **NAME**

  - Can only contain letters, digits, underscores and dots.
  - Has to be at least 5 and at most 32 characters.
  - Cannot start or end with an underscore or a dot.

- **DOMAIN**

  - Can only contain letters.
  - Has to be at least 3 and at most 12 characters.

- **EXT**
  - Can only contain letters.
  - Has to be at least 2 and at most 8 characters.

Each one of them is going to be a block of RegEx.

### Blocks

Import the `Block` module:

```javascript
import { Block } from 'regez';
```

Let's create the blocks.

#### NAME

Create the `NAME` block like this:

```javascript
const NAME = new Block('single-char');
```

**Explanation:**

- `Block` is a class module so we need to use the `new` keyword.
- We have two types of blocks:

  - `literal`: Matches the block literally. Same as `/.../`.
  - `single-char`: Matches any of the characters of the block; Meaning that the order is not important. Same as `/[...]/`.

  Since `NAME` can be anything, we will use a `single-char` block.

**Rule 1:** Can only contain letters, digits, underscores and dots.

To add perfect groups of characters such as all letters, we will use a method called `all()`:

```javascript
const NAME = new Block('single-char').all('letters', 'digits');

// Result: /[a-zA-Z\d]/
```

To add underscore and dot, we use the `chars()` method:

```javascript
const NAME = new Block('single-char').all('letters', 'digits').chars('_.');

// Result: /[a-zA-Z\d_\.]/
```

**Note:** Using a dot without escaping means matching all characters. RegEz adds a backslash to all special characters, meaning that you want to match that character literally; Not the special meaning of it.

**Rule 2:** Has to be at least 5 and at most 32 characters.

The current result matches only one character of those that we added. To add the length limit, we will use the `repeats()` method:

```javascript
const NAME = new Block('single-char')
  .all('letters', 'digits')
  .chars('_.')
  .repeats({ atLeast: 5, atMost: 32 });

// Result: /[a-zA-Z\d_\.]{5,32}/
```

**Note:** Method `repeats()` only works for `single-char` blocks. It has no effect on a `literal` block.

Method `repeats()` includes the following options:

- `times`: Gets one of the following values:
  - `zero-or-one`: Matches one character or nothing. Same as `/[...]?/`.
  - `zero-or-more`: Matches unlimited length of characters. Same as `/[...]*/`.
  - `one-or-more`: Matches at least one character. Same as `/[...]+/`.
- `exactly`: The exact number of repeats. For example `/[...]{3}/`.
- `atLeast`: The minimum number of repeats. For example `/[...]{3,}/`.
- `atMost`: The maximum number of repeats. For example `/[...]{,3}/`.

**Note:** You can use `atLeast` and `atMost` together. If you use the other options along with each other, the more important one will be considered:

_Options by importance: times > exactly > atLeast = atMost._

**Rule 3:** Cannot start or end with an underscore or a dot.

To apply this rule we have to create another block like this:

```javascript
const _NAME = new Block('single-char').chars('_.');

// Result: /[_\.]/
```

**Explanation:** To show that this is a rule for the beginning of `NAME`, I use an underscore before it. You can name it whatever you want.

To say that we **don't want** these characters, we use the the `except()` method:

```javascript
const _NAME = new Block('single-char').except().chars('_.');

// Result: /[^_\.]/
```

To make it more visible for this example, I make a copy of `_NAME` as `NAME_` for the end of `NAME` but you don't have to, since they're exactly the same.

#### DOMAIN and EXT

Like what we did with `NAME`:

```javascript
const DOMAIN = new Block('single-char')
  .all('letters')
  .repeats({ atLeast: 3, atMost: 12 });

// Result: /[a-zA-Z]{3,12}/

const EXT = new Block('single-char')
  .all('letters')
  .repeats({ atLeast: 2, atMost: 8 });

// Result: /[a-zA-Z]{2,8}/
```

All blocks have been created. Now we put them together.

### RegEz:

The `RegEz` module will do this for us.

```javascript
import { RegEz } from 'regez';

const emailRegEx = RegEz();
```

Imagine a structure of blocks like this: `((_NAME)(NAME)(NAME_))@(DOMAIN).(EXT)`.

To achieve this, we pass an "in-inny!" array of blocks as the first parameter:

```javascript
const emailRegEx = RegEz([
  [[_NAME], [NAME], [NAME_]],
  '@',
  [DOMAIN],
  '.',
  [EXT],
]);

// Result: /([^\d_\.])([a-zA-Z\d_\.]{5,32})([^\d_\.])@([a-zA-Z]{3,12})\.([a-zA-Z]{2,8})/
```

**Explanation:**

- As you can see, you can use both blocks and strings. Strings will match literally.
- If you use special characters in strings, RegEz will add a backslash to them and disable their special behavior.
- You can use nested arrays with any structure and depth you want; But too deep may cause stack overflow.

#### Flags

You can pass an array of RegEx flags as the second parameter. For this example, we want our RegEx to be case-insensitive. So we use the _insensitive_ flag:

```javascript
const emailRegEx = RegEz(
  [[[_NAME], [NAME], [NAME_]], '@', [DOMAIN], '.', [EXT]],
  ['insensitive']
);

// Result: /([^_\.])([a-zA-Z\d_\.]{5,32})([^_\.])@([a-zA-Z]{3,12})\.([a-zA-Z]{2,8})/i
```

This will add the `i` flag to the RegEx: `/.../i`.

See all RegEx flags [here](https://javascript.info/regexp-introduction#flags).

#### Begin ^ and End $

We expect an email string without anything before and after it. For example we don't want a match for: "hello kitkat1970@goomail.yum world!".

To achieve this, we pass `startOfLine` and `endOfLine` as the third and the fourth parameters:

```javascript
const emailRegEx = RegEz(
  [[[_NAME], [NAME], [NAME_]], '@', [DOMAIN], '.', [EXT]],
  ['insensitive'],
  true,
  true
);

// Result: /^([^_\.])([a-zA-Z\d_\.]{5,32})([^_\.])@([a-zA-Z]{3,12})\.([a-zA-Z]{2,8})$/i
```

This will add the `^` and the `$` to the RegEx: `/^...$/`. So the final result is:

```regexp
/^([^_\.])([a-zA-Z\d_\.]{5,32})([^_\.])@([a-zA-Z]{3,12})\.([a-zA-Z]{2,8})$/i
```

Now the RegEx is complete. Module `RegEz` returns a RegExp object. So you can test a string like this:

```javascript
emailRegEx.test('kitkat1970@goomail.yum');

// Result: true
```

## Configuration

RegEz prevents usual RegExp errors that crash the app. Instead it logges **Sweet Errors** that provide a solution to fix the error. It also logges warnings if you're doing something wrong or there's a better way of doing things.

To disable Sweet Errors and warnings, you can create the `regez.config.json` file in the root directory of your project like this:

```json
{
  "fullErrors": true,
  "noWarnings": true
}
```

## TypeScript

All type declarations come with the library in a `.d.ts` file.
