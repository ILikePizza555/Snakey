const http = require('http');
const {map} = require('rxjs/operators');
const {snake, bite} = require('../build/snakey');

const server = new http.Server();

const subscriber = snake(server, (obs) => {
  return bite(obs, 'GET', '/').pipe(map((ctx) =>
    () => {
      ctx.response.statusMessage = 200;
      ctx.response.write('Hello World!');
      ctx.response.end();
    }
  ));
});

server.listen(9000);
