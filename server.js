const path = require("path");
const crypto = require("crypto");

const app = require("fastify")({
  logger: false,
});

app.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

app.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

const redis = require("redis");
const redisClient = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

redisClient.connect();

const countVisitors = async () => {
  const cachedCount = await redisClient.get("visitor_count");
  if (cachedCount) {
    return parseInt(cachedCount);
  }

  const clientKeys = await redisClient.keys("client:*");
  const count = clientKeys.length;

  await redisClient.set("visitor_count", count, { EX: 5 });

  return count;
};

app.get("/", async (request, reply) => {
  const visitorCount = await countVisitors();

  let params = { visitorCount  };

  reply.view("/src/pages/index.hbs", params);
});

app.get("/count", async (request, reply) => {
  const clientId = request.headers["hey-look-at-us-id"] || crypto.randomUUID();

  redisClient.set(`client:${clientId}`, 1, { EX: 10 });
  const visitorCount = await countVisitors();

  reply
    .code(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({ clientId, visitorCount });
});

app.listen(process.env.PORT, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  app.log.info(`server listening on ${address}`);
});
