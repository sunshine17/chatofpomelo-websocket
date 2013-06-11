var chatRemote = require('../remote/simRemote');

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
    if (msg.evt) {};
//    msg.content
//    TODO: need to send msg to wc
	next(null, {
		route: msg.route
	});
};
