Snakey is a Observer-based web microframework for Node.js, built using Rxjs. Inspired by Express.js.

# Why?

I love Express.js. I love how simple it is to get an application up and running, but I dislike using callbacks for everything, and I dislike imperative programming. I searched far and wide for a callback-free web framework for Node.js, and was disappointed when I was unable to find anything. Thus, Snakey was born.

Snakey is for people like me who want to prevent themselves from getting trapped in Callback Hell, and also want to reap the benifits of Javascript's functional programming capabilities.

# Installation

Note that Snakey is still very much experimental.

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

Snakey provides you with an [Observable](https://rxjs.dev/api/index/class/Observable) stream of HTTP requests, and functional programming tools to shape the stream into whatever your app needs.

```js
const {of} = require('rxjs');
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

## Snakes

At the core of Snakey is the `Snake` type. A `Snake` is an array of rxjs [Operators](https://rxjs.dev/api/index/interface/Operator). 

## applySnake

The `applySnake` function takes an array of `Snake`s and generates multiple `Observable`s for each `Snake`. These `Observable`s are then connected to a Node `http.Server`, and subscribed to.

```ts
export function applySnakes(snake: Snake<any, any>, 
                            server: Server = new Server(),
                            observer = new ResponderObserver): SnakeResult;
```

The return value of `applySnake` is an object of three fields that contain the server, the generated `Observable`s and the `Subscription`s.

```ts
export type SnakeResult = {
  server: Server,
  streams: Observable<any>[]
  subscribers: Subscription[]
}
```

You can supply your own [Observer](https://rxjs.dev/api/index/interface/Observer) to use, but the default behavior is to call a function. This does mean that your `Stream`s should eventually return a function. This function is referred to as the `Responder`.

## Context

The beginning of all requests is `Context`. `applySnake` automatically converts all requests into `Context` objects. When building a `Snake`, you should assume that it will be piped over a `Observable<Context>` object.

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

`bite` is an operator for `Observable<Context>`. It creates an `Observable<Context>` that matches the `verb` and `pathPattern`. Path matching is done using `Context.match`, so any parameters or RegEx groups are preserved in the `pathMatch` property of `Context`.