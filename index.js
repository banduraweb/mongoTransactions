require("dotenv").config();
const express = require("express");
// const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./src/config/config");
const { MongoClient } = require("mongodb");
const app = express();
app.use(express.json({ extended: true }));

app.use(cors());

const port = config.port() || 8087;
// const { connection } = mongoose;
const client = new MongoClient(config.db());
(async () => {
  try {
    await client.connect();
    const server = app.listen(port, () => {
      console.log(`Started..on.port.${port}`);
    });
    // await client
    //   .db("mydb1")
    //   .collection("foo")
    //   .insertOne({ abc: 0 }, { writeConcern: { w: "majority" } });
    // await client
    //   .db("mydb2")
    //   .collection("bar")
    //   .insertOne({ xyz: 0 }, { writeConcern: { w: "majority" } });

    // Step 1: Start a Client Session
    const session = client.startSession();
    // Step 2: Optional. Define options to use for the transaction
    const transactionOptions = {
      readPreference: "primary",
      readConcern: { level: "local" },
      writeConcern: { w: "majority" },
    };
    try {
      await session.withTransaction(async () => {
        const coll1 = client.db("mydb1").collection("foo");
        const coll2 = client.db("mydb2").collection("bar");
        // Important:: You must pass the session to the operations
        await coll1.insertOne({ abc: "withTransactionError" }, { session });
        await coll2.insertOne({ xyz: "withTransactionError" }, { session });
      }, transactionOptions);
    } catch (e) {
      console.log(e, "transaction");
    } finally {
      await session.endSession();
      await client.close();
    }
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  } finally {
    await client.close();
    // await session.endSession();
  }
})();

// connection.once("open", () => {
//   console.log("MongoDB database connection established successfully");
// });
