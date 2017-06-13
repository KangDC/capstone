var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  post: {type: Schema.Types.ObjectId, index: true, required: true},     //게시물
  email: {type: String, required: true, index: true, trim: true},       //이메일
  nickname: {type: String, required: true, index: true, trim: true},    //닉네임
  content: {type:String, required: true},                               //댓글
  createdAt: {type: Date, default: Date.now}                            //작성시간
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});


var Post = mongoose.model('Reply', schema);


module.exports = Post;
