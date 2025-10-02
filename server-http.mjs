import http from "node:http";
import fs from "node:fs/promises";

const host = "localhost";
const port = 8000;

async function requestListener(request, response) {
  try {
    switch (true) {
      case request.url === "/" || request.url === "/index.html": {
        const contents = await fs.readFile("./static/index.html", "utf8");
        response.setHeader("Content-Type", "text/html");
        response.writeHead(200);
        return response.end(contents);
      }
      case request.url === "/random.html": {
        response.setHeader("Content-Type", "text/html");
        response.writeHead(200);
        return response.end(
          `<html><p>${Math.floor(100 * Math.random())}</p></html>`
        );
      }
      case /^\/random\/\d+$/.test(request.url): {
        const nb = parseInt(request.url.split("/")[2], 10);
        const items = Array.from({ length: nb })
          .map(() => `<li>${Math.floor(Math.random() * 100)}</li>`)
          .join("\n");
        response.setHeader("Content-Type", "text/html");
        response.writeHead(200);
        return response.end(`<html><ul>${items}</ul></html>`);
      }
      default: {
        response.writeHead(404);
        return response.end("<html><p>404: NOT FOUND</p></html>");
      }
    }
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    return response.end("<html><p>500: INTERNAL SERVER ERROR</p></html>");
  }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});