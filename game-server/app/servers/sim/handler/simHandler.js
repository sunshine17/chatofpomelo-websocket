var chatRemote = require('../remote/simRemote');
var prettyjson = require('prettyjson');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to wc
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
    var on_res = function(err, res){
        console.log(prettyjson.render(res));
        next(null, {res: res});
    };
    if (msg.evt) {
        this.app.wc_req_util.send_evt(msg.evt, msg.evt_key, on_res);
    }else{
        this.app.wc_req_util.send_text(msg.content, on_res);
    }
};
