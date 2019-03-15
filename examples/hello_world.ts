import {snake, Context, bite, applySnakes} from "../src/index";
import {Responder, textResponse} from "../src/response";
import {map} from "rxjs/operators";

const app = [
    snake<Context>()
        .chain(bite("GET", "/"))
        .chain(textResponse("Hello World!"))
]

const {server} = applySnakes(app);
server.listen(9000);