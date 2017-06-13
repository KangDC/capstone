var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  tobagiNo: {type: String, required: true, trim: true},
  decibel: {type: Number, trim: true},
  tempA: {type: Number, trim: true},
  humiA: {type: Number, trim: true},
  tempB: {type: Number, trim: true},
  humiB: {type: Number, trim: true},
  accelX: {type: Number, trim: true},
  accelY: {type: Number, trim: true},
  accelZ: {type: Number, trim: true},
  angulX: {type: Number, trim: true},
  angulY: {type: Number, trim: true},
  angulZ: {type: Number, trim: true},
  distdB: {type: Number, required: true, trim: true},
  distTempA: {type: Number, required: true, trim: true},
  distHumiA: {type: Number, required: true, trim: true},
  distTempB: {type: Number, required: true, trim: true},
  distHumiB: {type: Number, required: true, trim: true},
  distReverse: {type: Number, trim: true},
  distActivity: {type: Number, trim: true},
  measureDate: {type: Date, required: true}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Monitor = mongoose.model('Monitor', schema);

module.exports = Monitor;
