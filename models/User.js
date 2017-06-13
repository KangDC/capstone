var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    Schema = mongoose.Schema;

var schema = new Schema({
  auth: {type: String, required: true, trim: true},
  tobagiNo: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true},
  password: {type: String, required: true, trim: true},
  nickname: {type: String, required: true, trim: true},
  phoneNumber: {type: String, trim: true},
  babyName: {type: String, required: true, trim: true},
  joinDate: {type: Date, default: Date.now},
  rcvSMSdB: {type: Boolean, required: true, default: false},
  rcvSMSrv: {type: Boolean, required: true, default: false},
  rcvSMSTH: {type: Boolean, required: true, default: false},
  maxTempA: {type: Number, trim: true, default: 28},
  minTempA: {type: Number, trim: true, default: 23},
  maxHumiA: {type: Number, trim: true, default: 60},
  minHumiA: {type: Number, trim: true, default: 40},
  maxTempB: {type: Number, trim: true, default: 28},
  minTempB: {type: Number, trim: true, default: 23},
  maxHumiB: {type: Number, trim: true, default: 60},
  minHumiB: {type: Number, trim: true, default: 40}
  //babyBirth: {type: Date}
  //facebook: {id: String, token: String, photo: String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.methods.generateHash = function(password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

schema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model('User', schema);

module.exports = User;
