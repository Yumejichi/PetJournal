const express = require("express");
const exphbs = require("express-handlebars"); // Ensure this import is correct
const path = require("path");
const config = require("./modules/config.js");
const connectDB = require("./modules/db.js");
// Import routes
const indexRouter = require("./routes/index");
const session = require("express-session");

const app = express();

//Handlebars
const hbs = require("express-handlebars"); //Loading handlebars into constant hbs
app.set("view engine", "hbs"); //Setting view engine in express to 'hbs'
app.engine(
  "hbs",
  hbs.engine({
    //engine method of app with arguments 'hbs' and engine method of hbs with object
    layoutsDir: __dirname + "/views/layouts", //Set layoutsDir to current directory and '/views/layouts'
    defaultLayout: "main_layout", //Set defaultLayout to 'main_layout'
    //--Set partialsDir to current directory and '/views/partials'
    partialsDir: __dirname + "/views/partials",
    extname: "hbs", //Set extname to 'hbs'
  })
);

// Connect to the database
connectDB(true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    //--Use middleware instantiating session passing options object
    secret: "UsF c00kie s$cr$t", //Use signed cookies
    resave: true, //Resave option
    saveUninitialized: false, //saveUninitialized option
  }) //Ending object curly brace, session parenthesis
); //Ending app.use parenthesis

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Use the index router for all routes
app.use("/", indexRouter);

// Error handling for 404 - Page Not Found
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// Error handler middleware
app.use((error, req, res, next) => {
  const errCode = error.code || 500;
  const errMsg = error.message || "Internal Server Error";
  res
    .status(errCode)
    .send(`<h2>Error has occurred</h2>Error: ${errCode}<p>${errMsg}</p>`);
});

// Start the server
const host = config.host;
const port = config.port;
app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port} at ${new Date().toLocaleString()}`);
});
