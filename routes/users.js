var express = require('express'),
    bcrypt = require('bcryptjs'),
    User = require('../models/User'),
    SMSLog = require('../models/SMSLog');
var router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('/login');
  }
}

function validateForm(form, options) {
  var tobagiNo = form.tobagiNo || "";
  var email = form.email || "";
  var nickname = form.nickname || "";
  var babyName = form.babyName || "";
  var phoneNumber = form.phoneNumber || "";
  tobagiNo = tobagiNo.trim();
  email = email.trim();
  nickname = nickname.trim();
  babyName = babyName.trim();
  phoneNumber = phoneNumber.trim();

  if (!form.tobagiNo) {
    console.log('--토바기일련번호');
    return '토바기 일련번호를 입력해주세요.';
  }

  if (!email) {
    console.log('--이메일');
    return '이메일을 입력해주세요.';
  }

  if (!form.password && options.needPassword) {
    console.log('--비밀번호');
    return '비밀번호를 입력해주세요.';
  }

  if (form.password !== form.password_confirmation) {
    console.log('--비밀번호일치');
    return '비밀번호가 일치하지 않습니다.';
  }

  if (form.password.length < 6) {
    console.log('--비밀번호6자리');
    return '비밀번호는 6글자 이상이어야 합니다.';
  }


  if (!nickname) {
    console.log('--닉네임');
    return '닉네임을 입력해주세요.';
  }

  if (!babyName) {
    console.log('--아가이름');
    return '아가이름을 입력해주세요.';
  }
  if (!phoneNumber) {
    console.log('--휴대폰 번호');
    return '휴대폰 번호를 입력해주세요.';
  }
  return null;
}

function validateFormSettings(form, options) {

  if (!form.maxTempA) {
    return '적정온도 최대기준을 입력해주세요.';
  }
  if (!form.minTempA) {
    return '적정온도 최소기준을 입력해주세요.';
  }
  if (!form.maxHumiA) {
    return '적정습도 최대기준을 입력해주세요.';
  }
  if (!form.minHumiA) {
    return '적정습도 최소기준을 입력해주세요.';
  }
  if (form.maxTempA < form.minTempA) {
    return '적정온도 최대기준을 최소기준보다 높게 입력해주세요.';
  }
  if (form.maxHumiA < form.minHumiA) {
    return '적정습도 최대기준을 최소기준보다 높게 입력해주세요.';
  }

  return null;
}

/* GET users listing. */
router.get('/', needAuth, function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/index', {users: users});
  });
});

router.get('/joinus', function(req, res, next) {
  res.render('users/joinus', {messages: req.flash()});
});

router.get('/:id/edit', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.post('/', function(req, res, next) {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    console.log(err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 이메일 주소가 이미 존재합니다.');
      return res.redirect('back');
    }
    var newUser = new User({
      auth: req.body.auth,
      tobagiNo: req.body.tobagiNo,
      email: req.body.email,
      nickname: req.body.nickname,
      babyName: req.body.babyName,
      phoneNumber: req.body.phoneNumber
    });
    newUser.password = newUser.generateHash(req.body.password);

    newUser.save(function(err) {
      if (err) {
        next(err);
      } else {
        req.flash('success', '가입이 완료되었습니다. 로그인 해주세요.');
        res.redirect('/');
      }
    });
  });
  var newSMSLog = new SMSLog({
    tobagiNo         : req.body.tobagiNo,
    email            : req.body.email,
    phoneNumber      : req.body.phoneNumber,
    sendSMSdB        : false,
    sendSMSrv        : false,
    sendSMSTH        : false
  });
  newSMSLog.save(function(err) {
    if (err) {
      console.log('err ' + err);
    }
  });

});

router.put('/:id', function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 사용자입니다.');
      return res.redirect('back');
    }

    if (!user.validatePassword(req.body.current_password)) {
      req.flash('danger', '현재 비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }
    user.tobagiNo = req.body.tobagiNo;
    user.nickname = req.body.nickname;
    user.babyName = req.body.babyName;
    user.email = req.body.email;
    user.phoneNumber = req.body.phoneNumber;
    if (req.body.password) {
      user.password = user.generateHash(req.body.password);
    }

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '사용자 정보가 변경되었습니다.');
      res.render('users/show', {user: user});
      //res.redirect('/users/show');
    });
  });
});

router.delete('/:id', function(req, res, next) {
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '사용자 계정이 삭제되었습니다.');
    res.redirect('/users');
  });
});

router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/show', {user: user});
  });
});

router.get('/:id/settings', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/settings', {user: user});
  });
});

router.put('/settings/:id', function(req, res, next) {
  var err = validateFormSettings(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 사용자입니다.');
      return res.redirect('back');
    }

    user.rcvSMSdB = req.body.rcvSMSdB;
    user.rcvSMSrv = false;
    user.rcvSMSTH = req.body.rcvSMSTH;
    user.maxTempA = req.body.maxTempA;
    user.minTempA = req.body.minTempA;
    user.maxHumiA = req.body.maxHumiA;
    user.minHumiA = req.body.minHumiA;

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '설정이 변경되었습니다.');
      res.render('index', { title: 'TOBAGI' });
    });
  });
});

module.exports = router;
