var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  nickname: {type: String, required: true, trim: true},             //닉네임
  email: {type: String, required: true, trim: true},                //이메일
  atcRcd: {type: Boolean, required: true, default: false},
  fromDate: {type: Date},
  toDate: {type: Date},
  avgTemp: {type: String, trim: true},
  avgHumi: {type: String, trim: true},
  cryHour: {type: String, trim: true},
  actHour: {type: String, trim: true},
  title: {type: String, required: true, trim: true},                //글 제목
  content: {type: String, required: true},                           //글
  //images: [String],
  createdAt: {type: Date, default: Date.now},                       //작성일
  read: {type: Number, default: 0}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var BabyBook = mongoose.model('BabyBook', schema);

module.exports = BabyBook;
