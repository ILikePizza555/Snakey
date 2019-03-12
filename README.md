Snakey is a Observer-based web microframework for Node.js

# Installation

```
npm install snakey
```

or 

```
yarn add snakey
```

# Roadmap

- ~Convert url-params to TypeScript~
- Add a functional API for building responses

# Documentation

## Quickstart

```js
const {bite, applySnakes} = require('snakey');

const {server, streams, subscribers} = applySnakes([
    [
        bite('GET', '/'),
        switchMap((ctx) => of(
            () => {
              ctx.response.statusMessage = 200;
              ctx.response.write("Hello world!");
              ctx.response.end();
            }
        ))
    ]
]);

server.listen(9000);
```

## Snakes and Streams

At the core of Snakey is the `Snake` type. What's a `Snake`? It looks like this:

```
[]
```

That's right, an array. More specifically, an array of `Stream`s. What's a `Stream`? It's also an array! An array of functions that operate on `Observable`s. In technical terms, a `Stream` is an arary of operators. 

So, a `Snake` is an array of arrays of functions.

## applySnake

The `applySnake` function takes a `Snake` and generates multiple `Observable`s from the `Stream`s. These `Observable`s are then connected to a Node `http.Server`, and subscribed too.

```ts
export function applySnakes(snake: Snake<any, any>, 
                            server: Server = new Server(),
                            observer = new ResponderObserver): SnakeResult;
```

The return value of `applySnake` is on object containing the server, an array containing the generated `Observable`s and an aray containing the `Subscription`s.

```ts
export type SnakeResult = {
  server: Server,
  streams: Observable<any>[]
  subscribers: Subscription[]
}
```

You can supply your own `Observer` to use, but the default behavior is to call a function. This does mean that your `Stream`s should eventually return a function. This function is referred to as the `Responder`.

## Context

The beginning of all requests is `Context`. `applySnake` automatically converts all requests into `Context` objects. When building a `Snake`, you should assume that your `Stream`s will be called over a `Observable<Context>` object.

### Properties

| attributes | name | type | description |
| ---------- | ---- | ---- | ----------- |
| readonly   | request | http.IncomingMessage | The request object recieved from Node. |
| readonly   | response | http.ServerResponse | The response object recived from Node. |
| readonly   | uri | uri-js:URIComponents | Parsed request URI. |
| readonly   | pathMatch | PathMatch | RegExpExecArray | null = null | Parsed path against a pattern. This is set by the `match` function. |

### Methods

#### match(pattern: string | RegExp): Context

If `uri.path` matches `pattern` a new Context object with `pathMatch` set will be returned. Otherwise, `this` will be returned.

## bite(verb: string, pathPattern: string | RegExp)

`bite` is an operator for `Observable<Context>`. It creates an `Observable<Context>` that match the `verb` and `pathPattern`. Path matching is done using `Context.match`, so any parameters or RegEx groups are preserved in the `pathMatch` property of `Context`.