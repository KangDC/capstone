"use strict";
var uniqid = require('uniqid');
var crypto = require('crypto');
var request = require('request');
var fs = require('fs');

module.exports = function(toNumber, fromNumber, msg) {

    var apiKey = "NCSULZQHIC1K3RZX";
    var apiSecret = "VWUBG1XY3T1J7KXOPP82WKYX8YYFOXEZ";
    var timestamp = Math.floor(new Date().getTime() / 1000);
    var salt = uniqid();
    var signature = crypto.createHmac("md5", apiSecret).update(timestamp + salt).digest('hex');
    var to = toNumber;
    var from = fromNumber;
    var params = {
        "api_key": apiKey,
        "salt": salt,
        "signature": signature,
        "timestamp": timestamp,
        "to": to,
        "from": from,
        "text": msg,
        "type": "SMS"
    };
    var r = request.post({url:'http://api.coolsms.co.kr/sms/2/send', formData: params},function(err, res, body) {
            console.log("body:", body);
            if(!err && res.statusCode === '200') {
                console.log("body:", body);
            }
        });
};
