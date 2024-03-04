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
const sendMail = require("./utility/Nodemail");

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
    const allNotices = allInformation.collection("notices");

    //  getting all students mail of cse13batch without endpoint here
    const allStudentsMail = cse13batch.find(
      {},
      { projection: { email: 1, id: 1 } }
    );
    let studentMails = [];
    while (await allStudentsMail.hasNext()) {
      const students = await allStudentsMail.toArray();
      students.map((student) => {
        if (
          student.email !== undefined &&
          student.email !== null &&
          student.email !== ""
        ) {
          studentMails.push(student.email);
        }
      });
    }

    // console.log(studentMails);
    // all functions related to students are here -------------------
    app.get("/allDataofCSE13", async (req, res) => {
      const cursor = cse13batch.find({});
      const students = await cursor.toArray();
      res.send(students);
    });
    app.get("/getSortedDataofBatch13", async (req, res) => {
      let sortBy = req.query.sort;
      const query = {};
      const options = {
        collation: { locale: "en", strength: 2 },
        sort: { name: sortBy === "asc" ? 1 : sortBy === "dsc" && -1 },
      };
      const cursor = cse13batch.find(query, options);
      const students = await cursor.toArray();
      res.json(students);
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
      // console.log(data);
    });

    // ----------------- All notice related function are here -------------------------
    app.get("/allNotices", async (req, res) => {
      const cursor = allNotices.find({});
      const notices = await cursor.toArray();
      res.send(notices);
    });
    // get for those notice which are upcoming ----------------
    const randomColor = () => {
      // hexaCharacter = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
      hexaCharacter = ["A", "B", 1, "D", 6, "E", "F"];
      function getC(x) {
        return hexaCharacter[x];
      }
      let code = "#";
      for (let i = 0; i < 6; i++) {
        let position = Math.floor(Math.random() * hexaCharacter.length);
        code += getC(position);
      }
      return code;
    };

    app.get("/upcomingNotices", async (req, res) => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();

      const currentDate = new Date(`${yyyy}/${mm}/${dd}`);
      const Postion = () => {
        const list = [5, 10, 16, 20, 28, 36];
        const value = Math.floor(Math.random() * list.length);

        return list[value];
      };

      const allNotice = allNotices.find({});
      let UpComingNotices = [];
      const noticesD = await allNotice.toArray();
      for (let i of noticesD) {
        const l = Postion();
        const t = Postion();
        if (new Date(i.date) >= currentDate) {
          i.left = l;
          i.top = t;
          i.bgcolor = randomColor();
          UpComingNotices.push(i);
        }
      }
      res.send(UpComingNotices);
    });
    app.post("/addNewNotice", async (req, res) => {
      const data = req.body;
      const result = await allNotices.insertOne(data);
      res.send(result);
      // console.log(data);
    });

    // nodemailer
    app.post("/sendMail", async (req, res) => {
      const { info } = req.body;
      const { title, courseTeacher, course, description, date, time, room } =
        info;
      try {
        sendMail(
          title,
          courseTeacher,
          course,
          description,
          date,
          time,
          room,
          studentMails
        );
        res.send("Mail sent successfully");
      } catch (err) {
        res.send("Mail sent failed");
      }
      // console.log(info);
    });
    // --------------------------------------------------
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
