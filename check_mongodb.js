const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkMongoDB() {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB\n");

    const db = client.db();
    console.log(`Current database: ${db.databaseName}\n`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("=== ALL COLLECTIONS ===");
    collections.forEach((coll, i) => {
      console.log(`${i + 1}. ${coll.name}`);
    });

    // Check Crime collection
    console.log("\n=== CRIME COLLECTION ===");
    const crimeCollection = db.collection('Crime');
    const crimeCount = await crimeCollection.countDocuments();
    console.log(`Total documents in Crime collection: ${crimeCount}`);

    if (crimeCount > 0) {
      const allCrimes = await crimeCollection.find({}).sort({ createdAt: -1 }).toArray();
      console.log("\nAll crimes:");
      allCrimes.forEach((crime, i) => {
        console.log(`\n${i + 1}. ${crime.title || 'No title'}`);
        console.log(`   ID: ${crime._id}`);
        console.log(`   Description: ${crime.description?.substring(0, 50) || 'No description'}`);
        console.log(`   Status: ${crime.status || 'No status'}`);
        console.log(`   Created: ${crime.createdAt || 'No date'}`);
      });
    }

    // List all databases
    console.log("\n=== ALL DATABASES ===");
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    dbs.databases.forEach((database, i) => {
      console.log(`${i + 1}. ${database.name} (${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkMongoDB();
