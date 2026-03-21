const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Telemetry Diagnostic: Testing Native Node Driver...');

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('✅ Native Success: Cluster Reachable');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Connectivity Ping Success');
  } catch (e) {
    console.error('❌ Native Failure: Node Driver Sync Failure');
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
