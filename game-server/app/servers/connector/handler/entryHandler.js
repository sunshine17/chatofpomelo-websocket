module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry sim server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid
	var sessionService = self.app.get('sessionService');

	// duplicate log in
	if( !! sessionService.getByUid(uid)) {
		next(null, {code: 500, error: true});
		return;
	}
	session.bind(uid);
	session.on('closed', onUserLeave.bind(null, self.app));

	//put user into channel
	self.app.rpc.sim.simRemote.add(session, uid, self.app.get('serverId'), function(menus){
		next(null, {menus:menus});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
	app.rpc.sim.simRemote.kick(session, session.uid, app.get('serverId'), null);
};
