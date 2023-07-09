const express = require("express");
const session = require("express-session");
var path = require("path");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
var port = process.env.PORT || 8080;
const apiKey = "B2CEGNRYP0PYNG67";
const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const crypto = require("crypto");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname));

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/loginPage.html"));
});

app.get("/user-page", function (req, res) {
  res.sendFile(path.join(__dirname, "/userPage.html"));
});
app.get("/check-login", function (req, res) {
  const username = req.cookies.username;
  const password = req.cookies.password;

  // if (req.session.clientData)
  if (username && password) {
    // User is already logged in
    req.session.clientData = { email: username, password: password };
    res.status(200).json({ loggedIn: true, redirect: "/user-page" });
  } else {
    // User is not logged in
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
    });
    res.status(200).json({ loggedIn: false });
  }
  // if (req.session.clientData) {
  //   // User is logged in via session
  //   res.sendFile(path.join(__dirname, "/userPage.html"));
  // } else {
  //   const username = req.cookies.username;
  //   const password = req.cookies.password;

  //   if (username && password) {
  //     // User is logged in via "Remember Me" cookies
  //     // Validate the credentials against the database or any other method you use for validation
  //     // For simplicity, this example assumes a successful validation
  //     req.session.clientData = { email: username, password: password };
  //     res.sendFile(path.join(__dirname, "/userPage.html"));
  //   } else {
  //     // User is not logged in, redirect to the login page
  //     res.redirect("/");
  //   }
  // }
});
app.get("/graph/:stock", function (req, res) {
  res.sendFile(path.join(__dirname, "/graph.html"));
});
app.post("/get-graph", function (req, res) {
  var redi = "/graph/" + req.body.stock;
  res.status(200).json({ redirect: redi });
});
app.post("/sign-up", async function (req, res) {
  var user_mail = req.body.mail;
  var plaintextPassword = req.body.password;
  // const saltRounds = 10;
  // const fixedSalt = bcrypt.genSaltSync(saltRounds);

  const pswd = crypto
    .createHash("sha256")
    .update(plaintextPassword)
    .digest("hex");

  // const pswd = bcrypt.hashSync(plaintextPassword, fixedSalt);

  var query = { email: user_mail, password: pswd };
  const url = "mongodb+srv://taliabluom:054326Tb@cluster0.t12mock.mongodb.net/";
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("users");
    const d = await collection.findOne({ email: query.email });
    console.log(res);

    if (d) {
      res.status(400).json({ redirect: null });
      return;
    } else {
      const document = query;
      const result = await collection.insertOne(document);
      console.log("Inserted document:", result.insertedId);
      res.status(200).json({ redirect: "/" });
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  //await connectToMongoDB(); // Wait for the connection to be established
});

app.post("/login", async function (req, res) {
  var user_mail = req.body.email;
  var plaintextPassword = req.body.password;
  // const saltRounds = 10;
  // const fixedSalt = bcrypt.genSaltSync(saltRounds);

  const pswd = crypto
    .createHash("sha256")
    .update(plaintextPassword)
    .digest("hex");

  var query = { email: user_mail, password: pswd };
  const url = "mongodb+srv://taliabluom:054326Tb@cluster0.t12mock.mongodb.net/";
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("users");
    const d = await collection.findOne(query);
    console.log(res);

    if (d) {
      req.session.clientData = query;
      res.cookie("username", req.body.email, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // Expires in 30 days
      });
      res.cookie("password", req.body.password, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // Expires in 30 days
      });
      res.status(200).json({ redirect: "/user-page" });
    } else {
      res.status(400).json({ redirect: null });
      return;
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  //await connectToMongoDB(); // Wait for the connection to be established
});

// start the server
app.listen(port, () => {
  console.log("Server started! At http://localhost:" + port);
});

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

app.get("/u-page", async function (req, res) {
  var user_mail = req.session.clientData.email;
  var query = { email: user_mail };
  const url = "mongodb+srv://taliabluom:054326Tb@cluster0.t12mock.mongodb.net/";
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("user_stocks");
    const cursor = collection.find(query);
    let stocks = [];

    // Create an array of promises to store each request
    const requestPromises = [];

    for await (const doc of cursor) {
      let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${doc.stock}&apikey=${apiKey}`;

      // Create a promise for each request and push it to the array
      const requestPromise = new Promise((resolve, reject) => {
        request.get(
          {
            url: url,
            json: true,
            headers: { "User-Agent": "request" },
          },
          (err, res, data) => {
            if (err) {
              console.log("Error:", err);
              reject(err);
            } else if (res.statusCode !== 200) {
              console.log("Status:", res.statusCode);
              reject(
                new Error(`Request failed with status code ${res.statusCode}`)
              );
            } else {
              // data is successfully parsed as a JSON object:
              let quote = data["Global Quote"];
              let jstock = { name: doc.stock, cost: quote["05. price"] };
              resolve(jstock);
            }
          }
        );
      });

      requestPromises.push(requestPromise);
    }

    // Await all the requests to finish
    const stockData = await Promise.all(requestPromises);

    // Add the stock data to the stocks array
    stocks = stocks.concat(stockData);

    res.status(200).send(stocks);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

app.post("/search", async function (req, res) {
  var user_mail = req.session.clientData.email;
  var query = { email: user_mail, stock: req.body.stock };

  const durl =
    "mongodb+srv://taliabluom:054326Tb@cluster0.t12mock.mongodb.net/";
  const client = new MongoClient(durl);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("user_stocks");
    const d = await collection.findOne(query);
    console.log(res);

    if (d) {
      res.status(400).json({ msg: "The stock already exist" });
      return;
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  // Create an array of promises to store each request
  let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${req.body.stock}&apikey=${apiKey}`;

  // Create a promise for the API request
  const requestPromise = new Promise((resolve, reject) => {
    request.get(
      {
        url: url,
        json: true,
        headers: { "User-Agent": "request" },
      },
      (err, response, data) => {
        if (err) {
          console.log("Error:", err);
          reject(err);
        } else if (response.statusCode !== 200) {
          console.log("Status:", response.statusCode);
          reject(
            new Error(`Request failed with status code ${response.statusCode}`)
          );
        } else {
          // data is successfully parsed as a JSON object:
          let quote = data["Global Quote"];
          if (
            quote == null ||
            quote === undefined ||
            Object.keys(quote).length === 0
          ) {
            res.status(400).json({ msg: "This stock does not exist" });
            return;
          }

          let jstock = { name: req.body.stock, cost: quote["05. price"] };
          resolve(jstock);
        }
      }
    );
  });
  //

  try {
    // Await the API request to finish
    const stockData = await requestPromise;

    // Check if the stock exists before inserting it into the database
    if (!stockData.name || !stockData.cost) {
      res.status(400).json({ redirect: null });
      return;
    }

    const conurl =
      "mongodb+srv://taliabluom:054326Tb@cluster0.t12mock.mongodb.net/";
    const client = new MongoClient(conurl);

    try {
      // Connect to the MongoDB cluster
      await client.connect();

      // Make the appropriate DB calls
      await listDatabases(client);
      const database = client.db("Stocks");
      const collection = database.collection("user_stocks");
      const result = await collection.insertOne(query);
      res.status(200).json(stockData);
    } catch (e) {
      console.error(e);
      res.status(400).send(e);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

app.post("/delete-stock", async function (req, res) {
  var user_mail = req.session.clientData.email;
  var query = { email: user_mail, stock: req.body.stockName };

  const durl =
    "mongodb+srv://taliabluom:054326Tb@cluster0.t12mock.mongodb.net/";
  const client = new MongoClient(durl);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("user_stocks");
    const d = await collection.deleteOne(query);
    res.status(200).send("ok");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

app.get("/logout", (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
  });
  res.clearCookie("username");
  res.clearCookie("password");

  res.status(200).json({ redirect: "/" });
});

app.post("/send-email", (req, res) => {
  // Extract the recipient's email and email body from the request
  const text_contact = req.body.contact;
  const email = req.body.email;
  recipientEmail = "taliabluom@gmail.com";

  // Create a Nodemailer transporter
  // const transporter1 = nodemailer.createTransport({
  //   // Configure your email provider here
  //   service: "Walla",
  //   auth: {
  //     user: "taliaadi1234@walla.co.il",
  //     pass: "13579Adi!",
  //   },
  // });
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.walla.co.il",
  //   port: 587,
  //   secure: false, // Set to true if using SSL/TLS encrypted connection (port 465)
  //   auth: {
  //     user: "taliaadi1234@walla.co.il",
  //     pass: "13579Adi!",
  //   },
  // });
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "taliaadi@outlook.com",
      pass: "Ida123456!!",
    },
  });

  // Define the email options
  const mailOptions = {
    from: "taliaadi@outlook.com",
    to: recipientEmail,
    subject: "contact us",
    text: email + " send you a new message: " + text_contact,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      res.status(200).json({ redirect: "/user-page" });
    }
  });
});
