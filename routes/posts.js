var express = require('express'),
    Post = require('../models/Post'),
    User = require('../models/User'),
    Reply = require('../models/Reply');
var router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('/login');
  }
}

function validateForm(form) {
  var email = form.email || "";
  var title = form.title || "";
  //email과  title을 앞뒤에 공백이 없게...
  email = email.trim();
  title = title.trim();

  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (!title) {
    return '글제목을 입력해주세요.';
  }

  if (!form.content) {
    return '글내용을 입력해주세요.';
  }

  return null;
}

function Pagination(count, limit, page){
    // 경로를 저장할 변수
    var  url;
    // 마지막 페이지의 번호를 가지는 변수
    var maxPage = Math.ceil(count / limit);

    // 모든 페이지들의 정보를 담은 변수
    var pagination = {
        numPosts : count,        // post들의 갯수
        pages : [],              // 각각의 페이지의 정보
        firstPage : {            // 첫 페이지의 정보
            cls : 'firstPage',
            url : '/posts?page=1'
        },
        prevPage : {             // 이전 페이지 정보
            cls : 'prevPage',
            url : url
        },
        nextPage : {             // 다음 페이지 정보
            cls : 'nextPage',
            url : url
        },
        lastPage : {             // 마지막 페이지 정보
            cls : 'lastPage',
            url : '/posts?page='+maxPage
        },
    };

    // 이전 페이지 객체의 내부 변수 설정
    if(!(page) || (page) === 1){
        pagination.prevPage.url = '/posts?page=1';
    }else{
        pagination.prevPage.url = '/posts?page='+(page - 1);
    }

    // 다음 페이지 객체의 내부 변수 설정
    if(!(page)){
        if(maxPage === 1){
            pagination.nextPage.url = '/posts?page=1';
        }else{
            pagination.nextPage.url = '/posts?page=2';
        }
    }else if(parseInt(page) === parseInt(maxPage)){
        pagination.nextPage.url = '/posts?page='+maxPage;
    }else{
        pagination.nextPage.url = '/posts?page='+(page + 1);
    }

    // 반복문을 실행하면서 각각의 페이지 객체의 내부 변수 설정
    for(var i = 0; i < maxPage; i++){
        var data = {
            cls : 'page',
            url : '/posts?page='+(i+1),
            text : i+1
        };
        pagination.pages[i] = data;
    }

    return pagination;
}

//게시판 누르면...
router.get('/', needAuth, function(req, res, next) {
  var page = Math.max(1, req.query.page); // 현재 페이지의 쿼리를 받아오는 변수
  var limit = 5;  // 한 페이지에 보일 글 수
  var skip = (page - 1) * limit;  // 화면에 post를 limit갯수만큼 보여줄 때 건너뛸 post의 갯수를 갖는 변수

  // post들의 갯수를 반환해주는 메소드
  Post.count({}, function(err, count){
      if(err){
           return next(err);
      }
      var pagination = Pagination(count, limit, page);

      // /posts/index페이지에 보여줄 post의 갯수를 limit으로 하고 skip갯수만큼 건너 뛰면서 화면에 보여준다.
      Post.find().sort({createdAt:-1}).skip(skip).limit(limit).exec(function(err, posts) {
          if (err) {
               return next(err);
          }

          // /posts/index에 currentUser정보와 posts와 pagination을 매개변수로 넘겨준다.
          res.render('posts/index', {user: res.locals.currentUser,
            posts: posts, pagination:pagination});
      });
  });
});

//글쓰기 버튼 누르면...
router.get('/new', needAuth,  function(req, res, next) {
  res.render('posts/edit', {user: res.locals.currentUser, post:{}});
});

//수정 버튼 누르면...
router.get('/:id/edit', needAuth,  function(req, res, next) {
  Post.findById({_id: req.params.id}, function(err, post) {
    if (err) {
      return next(err);
    }
    User.findOne({email: post.email}, function(err, user) {
      if(err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      res.render('posts/edit', {user: user, post: post});
    });
  });
});

//글제목 누르면...
router.get('/:id', needAuth, function(req, res, next) {
  Post.findById({_id: req.params.id}, function(err, post) {
    if (err) {
      return next(err);
    }
    //조회수 증가해주고
    post.read++;
    //저장
    post.save(function(err) {
      if (err) {
        return next(err);
      }
      Reply.find({post: post.id}, function(err, replys){
        if(err){
          return next(err);
        }
        //게시글, 댓글 보여줌...
        res.render('posts/show', {user: res.locals.currentUser, post: post, replys: replys});
      });
    });
  });
});

//글 수정 부분
router.put('/:id', needAuth,  function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    return res.redirect('back');
  }
  //id일치하는 것 찾아서
  Post.findById({_id: req.params.id}, function(err, post) {
    if (err) {
      return next(err);
    }
    if (!post) {
      return res.redirect('back');
    }
    User.findOne({email: post.email}, function(err, user) {
      if (err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      //title, content 수정
      post.title = req.body.title;
      post.content = req.body.content;
    });
    //저장
    post.save(function(err) {
      if (err) {
        return next(err);
      }
      //게시물 목록으로 이동...
      res.redirect('/posts');
    });
  });
});

//삭제...
router.delete('/:id', needAuth, function(req, res, next) {
  //id일치하는 것 찾아서
  Post.findById({_id: req.params.id}, function(err, post) {
    if (err) {
      return next(err);
    }
    if (!post) {
      return res.redirect('back');
    }
    User.findOne({email: post.email}, function(err, user) {
      if (err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      post.remove(function(err){
        if (err) {
          return next(err);
        }
        res.redirect('/posts');
      });
    });
  });
});



router.post('/', needAuth, function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    return res.redirect('back');
  }
 //새 게시물 객체 생성해서 받은 값들 넣어주고
  var newPost = new Post({
    email: req.body.email,
    nickname: req.body.nickname,
    title: req.body.title,
    content: req.body.content,
    read: 0
  });
  //저장
  newPost.save(function(err) {
    if (err) {
      return next(err);
    } else {
      //게시물 목록으로 이동...
      res.redirect('/posts');
    }
  });
});

// 댓글 부분...
router.post('/:id/reply', needAuth, function(req, res, next) {
  Post.findById({_id: req.params.id}, function(err, post) {
    if (err) {
      return next(err);
    }
    var newReply = new Reply({
      post: post.id,
      email: res.locals.currentUser.email,
      nickname: res.locals.currentUser.nickname,
      content: req.body.reply
    });
    newReply.save(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/posts/' + post.id);
    });
  });
});

router.delete('/:id/reply', needAuth, function(req, res, next) {
  Reply.findById({_id: req.params.id}, function(err, reply) {
    if (err) {
      return next(err);
    }
    User.findOne({email: reply.email}, function(err, user) {
      if (err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      reply.remove(function(err){
        if(err) {
          return next(err);
        }
        res.redirect('back');
      });
    });
  });
});

module.exports = router;
