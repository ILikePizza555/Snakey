const {of} = require('rxjs');
const {switchMap} = require('rxjs/operators');
const {snake, bite, apply} = require('../build/snakey');

const app = snake(
    snake(
        bite('GET', '/:param+'),
        switchMap((ctx) => of(
            () => {
              ctx.response.statusMessage = 200;
              ctx.response.write(JSON.stringify(ctx.pathMatch));
              ctx.response.end();
            }
        ))
    ),
    snake(
        bite('GET', '/'),
        switchMap((ctx) => of(
            () => {
              ctx.response.statusMessage = 200;
              ctx.response.write('Hello World!');
              ctx.response.end();
            }
        )),
    )
);

const {server, subscribers} = apply({'streams': app});

server.listen(9000);
