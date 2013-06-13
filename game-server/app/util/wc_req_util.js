var _ = require('underscore')._;
var prettyjson = require('prettyjson');

var bootstrap = require('./bootstrap');
var makeRequest = bootstrap.makeRequest;

// type: location/image/event/text

var url = global._app.conf.wc.url;
var token = global._app.conf.wc.token;

var _info = {
    sp: 'simulator',
    user: 'simulator-user',
    type: 'event'
};

var _send_req = makeRequest(url, token);

var exp = module.exports;

exp.send_evt = function(evt, key, cb){
    _info.event = evt;
    _info.eventKey = key;
    _send_req(_info, cb);
};

exp.send_text = function(text, cb){
    _send_req(text, cb);
};



