// Import dependencies modules:
const express = require('express');

// Create an Express.js instance:
const app = express();

// Config Express.js
app.use(express.json());
app.set('port', 3000); // Update to match the listening port

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});

// Connect to MongoDB
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(
  'mongodb+srv://muhammadibrahimabdallah782:Nov262003&@cluster0.5afkpqu.mongodb.net/',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

let db;
client.connect()
  .then(() => {
    db = client.db('Coursework2');
    console.log("Connected to MongoDB");
  })
  .catch(error => {
    console.error("Failed to connect to MongoDB", error);
  });

// Logger Middleware
app.use((req, res, next) => {
  var log = `${req.ip} -- ${req.method} ${req.path} ${res.statusCode}`;
  console.log(log, req.body);
  next();
});

app.get("/", (req, res) => {
  res.send("Select a collection, e.g., /collection/lessons");
});

// retrieve all the object from a collection
app.get("/collection/:collectionName", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .find({})
      .toArray()
      .then((results) => {
        res.send(results);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Search
app.post("/search/collection/lessons/", (req, res) => {
  try {
    let search = req.body.search;
    let sort = req.body.sort || "title";
    let order = req.body.order === "desc" ? -1 : 1;

    if (search) {
      search = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      search = {};
    }

    db.collection("lessons")
      .find(search)
      .sort({ [sort]: order })
      .toArray()
      .then((results) => {
        res.send(results);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//to insert a document to the collection
app.post("/collection/:collectionName", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .insertOne(req.body)
      .then((results) => {
        res.send(results);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((results) => {
        res.send(results);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//to update a document by ID
app.put("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
      .then((results) => {
        res.send(results);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/collection/:collectionName/:id", (req, res) => {
  try {
    db.collection(req.params.collectionName)
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((results) => {
        res.send(results);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Express.js server running at PORT 3000");
});
