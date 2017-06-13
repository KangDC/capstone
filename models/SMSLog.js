var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  tobagiNo: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true},
  phoneNumber: {type: String, trim: true},
  sendSMSdB: {type: Boolean, required: true, default: false},
  sendSMSrv: {type: Boolean, required: true, default: false},
  sendSMSTH: {type: Boolean, required: true, default: false},
  sendDate: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var SMSLog = mongoose.model('SMSLog', schema);

module.exports = SMSLog;
