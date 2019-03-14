const {of} = require('rxjs');
const {switchMap} = require('rxjs/operators');
const {snake, bite, applySnakes} = require('../dist/index');

const app = [
  snake()
      .chain(bite('GET', '/'))
      .chain(
          switchMap((ctx) => of(
              () => {
                ctx.response.statusMessage = 200;
                ctx.response.write('Hello world!');
                ctx.response.end();
              }
          ))
      ),
];

const {server, streams, subscribers} = applySnakes(app);
server.listen(9000);
