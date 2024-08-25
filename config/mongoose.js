const mongoose = require('mongoose')
const debuglog = require('debug')("development:mongooseconfig");

mongoose.connect('mongodb://127.0.0.1:27017/registerdb')

const db = mongoose.connection

db.on('error', function(error){
  console.log(error)
})

db.on('open',function(){
  console.log('mongodb Connection Sucessfull')
})