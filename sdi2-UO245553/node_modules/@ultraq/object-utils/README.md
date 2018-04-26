
object-utils
============

[![Build Status](https://travis-ci.org/ultraq/object-utils.svg?branch=master)](https://travis-ci.org/ultraq/object-utils)
[![Coverage Status](https://coveralls.io/repos/github/ultraq/object-utils/badge.svg?branch=master)](https://coveralls.io/github/ultraq/object-utils?branch=master)
[![npm](https://img.shields.io/npm/v/@ultraq/object-utils.svg?maxAge=3600)](https://www.npmjs.com/package/@ultraq/object-utils)
[![License](https://img.shields.io/github/license/ultraq/object-utils.svg?maxAge=2592000)](https://github.com/ultraq/object-utils/blob/master/LICENSE.txt)

A collection of utilities for JavaScript objects.


Installation
------------

Via npm:

```
npm install @ultraq/object-utils --save
```

Via bower:

```
bower install https://github.com/ultraq/object-utils.git --save
```


API
---

### merge(target, ...sources)

Deep-merges all of the properties of the objects in `sources` with `target`,
modifying the target object and returning it.

 - **target**: object to merge values into
 - **sources**: array of argument list of objects to copy values from

### navigate(object, path)

Returns a value from an object via a path string that describes the nesting of
objects to get to the value, eg:

```javascript
let object = {
  greeting: {
    message: 'Hello!'
  }
};
let pathToMessage = 'greeting.message';
```

If the path doesn't resolve to anything, then `undefined` is returned.

 - **object**:  object to search through
 - **path**: a dot-separated path string to get to the desired value within the object
