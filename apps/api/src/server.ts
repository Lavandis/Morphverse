import { createServer } from "node:http";
import { routeRequest } from "./routes/router";

const port = Number(process.env.PORT ?? 8787);

createServer((request, response) => {
  void routeRequest(request, response);
}).listen(port, () => {
  console.log(`Morphverse API listening on http://localhost:${port}`);
});
