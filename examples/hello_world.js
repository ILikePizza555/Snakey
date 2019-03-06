const {snake, bite} = require('../src/snakey');
const {map} = require('rxjs/operators');

const server = snake((o) =>
  bite(o, 'GET', '/').pipe(map((ctx) => ctx.makeResponse().code(200).body('Hello World!')))
);

server.listen(9000);
