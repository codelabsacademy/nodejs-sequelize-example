// Importing the http module (NodeJS core module)
const http = require("http");
const ejs = require("ejs");
const fs = require("fs");
const url = require("url");
const path = require("path");
const { parse } = require("querystring");
const { Sequelize, DataTypes } = require("sequelize");
const { title } = require("process");

// Option 2: Passing parameters separately (sqlite)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db.sqlite",
});

sequelize
  .authenticate()
  .then((data) => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const Todo = sequelize.define("todo", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1,
    primaryKey: true,
  },
  title: DataTypes.TEXT,
  completed: DataTypes.BOOLEAN,
});

console.log(Todo === sequelize.models.Todo); // True

const main = async () => {
  await sequelize.sync({ alter: true });

  const newTodo = Todo.build({
    title: "Third todo item NEW!!!!!",
    completed: true,
  });

  // await newTodo.save();

  const todos = await Todo.findAll({
    raw: true,
  });

  const completedTodos = await Todo.findAll({
    raw: true,
    where: {
      completed: 1,
    },
  });

  console.log("-----------------");
  console.log(todos);
};

main();

const addTodo = async (title) => {
  await sequelize.sync({ alter: true });

  const newTodo = Todo.build({
    title,
    completed: false,
  });

  await newTodo.save();
};

const fetchTodos = async () => {
  await sequelize.sync({ alter: true });

  const todos = await Todo.findAll({
    raw: true,
  });

  return todos
};

http
  .createServer(async function (req, res) {
    // Read the home.ejs file (__dirname => is the path of the root directory)
    const homePath = __dirname + "/views" + "/home.ejs";
    const add_path = __dirname + "/views" + "/add.ejs";
    const home = fs.readFileSync(homePath, "utf8");

    console.log(req.url);
    console.log(url.parse(req.url));

    var requestedPath = url.parse(req.url).pathname;

    console.log(requestedPath);

    // Current todo list
    // const todos = ["Finish this tutorial", "Clean the Room", "Take a walk"];

    const todos = await fetchTodos()

    if (req.url === "/add") {
      let body = "";

      req.on("data", function (chunk) {
        // do this when  you receive data
        body += chunk.toString();
      });

      req.on("end", async function () {

        await addTodo(parse(body).todo);

        const output = ejs.render(home, { todos, path: add_path });
        res.writeHead(201, { "Content-Type": "text/html" });
        res.end(output);
      });
    } else if (req.url.match(".css$")) {
      const cssPath = path.join(__dirname, "public", req.url);
      const fileStream = fs.createReadStream(cssPath, "UTF-8");
      res.writeHead(200, { "Content-Type": "text/css" });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      const output = ejs.render(home, { todos, path: add_path });
      res.end(output);
    }
  })
  .listen(3000);
