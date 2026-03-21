const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Telemetry Diagnostic: Testing Registry Connection...');
console.log('URI:', uri ? 'Target Acquired' : 'Target Missing');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Diagnostic Success: Matrix Registry Reachable');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Diagnostic Failure: Matrix Registry Terminal Off-line');
    console.error(err);
    process.exit(1);
  });
