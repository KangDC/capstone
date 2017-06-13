var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  nickname: {type: String, required: true, trim: true},             //닉네임
  email: {type: String, required: true, trim: true},                //이메일
  title: {type: String, required: true, trim: true},                //글 제목
  content: {type: String, required: true},                          //글
  createdAt: {type: Date, default: Date.now},                       //작성일
  read: {type: Number, default: 0}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Post = mongoose.model('Post', schema);

module.exports = Post;
