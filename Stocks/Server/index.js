const express = require("express");
const session=require("express-session");
var path = require("path");
const bodyParser = require("body-parser");
const request = require('request');
const app = express();
var port = process.env.PORT || 8080;
const apiKey = 'B2CEGNRYP0PYNG67';
const { MongoClient } = require("mongodb");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname));

app.use(session({
  secret:'mysecretkey', 
  resave:false, 
  saveUninitialized:true}));


app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/loginPage.html"));
});

app.get("/user-page", function (req, res) {
  res.sendFile(path.join(__dirname, "/userPage.html"));
});


app.post("/sign-up", async function (req, res) {
  var user_mail = req.body.mail;
  var pswd = req.body.password;
  var query = { email: user_mail, password: pswd };
  const url =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1";
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
      res.status(400).json({redirect: null});
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
  var pswd = req.body.password;
  var query = { email: user_mail, password: pswd };
  const url =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1";
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
      req.session.clientData=query;
      res.status(200).json({ redirect: "/user-page" });
    
    } else {
      res.status(400).json({redirect: null});
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


/*app.get("/u-page", async function (req, res) {
  var user_mail = req.session.clientData.email;
  var query = {"email": user_mail};
  const url =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1";
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("user_stocks");
    const d = await collection.find(query);
    console.log(res);


    if (d!=undefined) {
      let stocks=[];
      d.data.forEach(stk=> 
        {
          let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stk.stock}&apikey=${apiKey}`;
          request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) 
            {
              let data = JSON.parse(body);
              let quote = data['Global Quote'];
              let jstock={"name":stk.stock,"cost":quote['05. price']};
              stocks.push(jstock);
            } 
            else 
            {
              console.error('Request failed with status code:', response.statusCode);
            }
          });
        });
    res.status(200).send(stocks);
    
  } else {
    res.status(400).json({redirect: null});
    return;
  }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  //await connectToMongoDB(); // Wait for the connection to be established
});
*/


/*app.
get("/u-page", async function (req, res) {
  var user_mail = req.session.clientData.email;
  var query = {"email": user_mail};
  const url =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1";
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    const database = client.db("Stocks");
    const collection = database.collection("user_stocks");
    const cursor = collection.find(query);
    let stocks=[];
    for await (const doc of cursor) 
    {
      let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${doc.stock}&apikey=${apiKey}`;
      
      request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
      }, (err, res, data) => {
        if (err) {
          console.log('Error:', err);
        } else if (res.statusCode !== 200) {
          console.log('Status:', res.statusCode);
        } 
        else 
        {
          // data is successfully parsed as a JSON object:
         // let d = JSON.parse(data);
          let quote = data['Global Quote'];
          let jstock={"name":doc.stock,"cost":quote['05. price']};
          stocks.push(jstock);
        }

      });
  }

  res.status(200).send(stocks);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  //await connectToMongoDB(); // Wait for the connection to be established
});
*/

app.get("/u-page", async function (req, res) {
  var user_mail = req.session.clientData.email;
  var query = { "email": user_mail };
  const url =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1";
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
            headers: { 'User-Agent': 'request' }
          },
          (err, res, data) => {
            if (err) {
              console.log('Error:', err);
              reject(err);
            } else if (res.statusCode !== 200) {
              console.log('Status:', res.statusCode);
              reject(new Error(`Request failed with status code ${res.statusCode}`));
            } else {
              // data is successfully parsed as a JSON object:
              let quote = data['Global Quote'];
              let jstock = { "name": doc.stock, "cost": quote['05. price'] };
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



