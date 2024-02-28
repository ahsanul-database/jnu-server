const cors = require("cors");
const express = require("express");
const port = process.env.PORT || 3000;

// middlewire for data parsing and cors
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();

// server domain : cse-jnu-server
app.get("/", (req, res) => {
  res.send("Welcome to CSE JnU Server");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const uri = "mongodb://0.0.0.0:27017/";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ranzbu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// const client = new MongoClient(uri);

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const allInformation = client.db("allInformation");
    const cse13batch = allInformation.collection("cse13batch");
    const allnotes = allInformation.collection("notes");

    // all get functions are here
    app.get("/allDataofCSE13", async (req, res) => {
      const cursor = cse13batch.find({});
      const students = await cursor.toArray();
      res.send(students);
    });

    app.get("/allStudentsMailID", async (req, res) => {
      const cursor = cse13batch.find({}, { projection: { email: 1, id: 1 } });
      const students = await cursor.toArray();
      res.send(students);
    });

    app.get("/getMySpecificInfoUsingMail", async (req, res) => {
      const query = req.query.email;
      const data = await cse13batch.findOne(
        { email: query },
        { projection: { id: 1, name: 1 } }
      );
      res.send(data);
    });

    app.get("/allDataofCSE13ID", async (req, res) => {
      const cursor = cse13batch.find(
        {},
        {
          projection: {
            id: 1,
            name: 1,
            blood: 1,
            gender: 1,
            photo: 1,
            phone_number: 1,
          },
        }
      );
      const students = await cursor.toArray();
      res.send(students);
    });
    app.get("/allDataofCSE13/:id", async (req, res) => {
      const id = req.params.id.toUpperCase();
      const data = await cse13batch.findOne({ id: id });
      res.send(data);
    });

    app.get("/userProfileDetails", async (req, res) => {
      const query = req.query.email;
      const data = await cse13batch.findOne({ email: query });
      res.send(data);
    });

    // all post functions are here
    app.post("/updateStudentData", async (req, res) => {
      const data = req.body;
      const result = await cse13batch.insertOne(data);
      res.send(result);
      console.log(data);
    });

    // all put/patch functions are here
    app.patch("/UpdateMyData/:id", async (req, res) => {
      const ID = req.params.id;
      const data = await req.body;
      const filter = { _id: new ObjectId(ID) };
      const document = await cse13batch.findOne(filter);

      Object.keys(data).forEach((key) => {
        if (key !== "_id" && data[key] !== undefined) {
          document[key] = data[key];
        }
      });

      const result = await cse13batch.replaceOne(filter, document);
      res.send(result);
    });
    // --------------------- Notes function -------------------------
    app.get("/allNotesbybatch13", async (req, res) => {
      const cursor = allnotes.find({});
      const notes = await cursor.toArray();
      res.send(notes);
    });

    app.post("/addYourNotesinDB", async (req, res) => {
      const data = req.body;
      const result = await allnotes.insertOne(data);
      res.send(result);
      console.log(data);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.log);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
