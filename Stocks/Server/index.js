const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
let db = null;
let client = null; // Declare the client variable

const { MongoClient } = require('mongodb');

const connectToMongoDB = async () => {
  try {
    const url = 'mongodb://localhost:27017'; // Replace with your MongoDB server URL
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    client = await MongoClient.connect(url, options); // Assign the client

    // Connected successfully
    console.log('Connected to MongoDB');

    // Assign the database to the db variable
    db = client.db('Stocks'); 
    console.log(db);

    // Perform operations on the database

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    if (client) {
      client.close(); // Close the connection when an error occurs
    }
  }
};

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/sign-up', function (req, res) {
  res.send("Hello !");
});

app.post('/sign-up', async function (req, res) {
  var user_mail = req.body.email;
  var pswd = req.body.password;

  await connectToMongoDB(); // Wait for the connection to be established

  // Get a reference to the collection
  if(db)
  {
    const collection = db.collection('users'); // Replace with your collection name
  }

  else {
    throw new Error('Database connection not established');
  }

  // Query the collection to access a specific value
  const query = { email: user_mail, password: pswd }; // Example query
  const document = await collection.findOne(query);

  if (document) {
    console.log('Age:');
  } else {
    const document = query;
    const result = await collection.insertOne(document);
    console.log('Inserted document:', result.insertedId);
    res.send("succ");
  }
});

// start the server
app.listen(port, () => {
  console.log('Server started! At http://localhost:' + port);
});
