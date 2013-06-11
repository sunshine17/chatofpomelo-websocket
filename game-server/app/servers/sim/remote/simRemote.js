module.exports = function(app) {
	return new SimRemote(app);
};

var CH_NAME = 'sim';

var SimRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into sim channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 *
 */
SimRemote.prototype.add = function(uid, sid, cb) {
	var channel = this.channelService.getChannel(CH_NAME, true);
	var username = uid.split('*')[0];
	if( !! channel) {
		channel.add(uid, sid);
	}
	this.getMenus(cb);
};

SimRemote.prototype.getMenus = function(cb) {
    this.app.httpUtil.curlGet(this.app.conf.getMenuUrl, function(err, data){
        var menu;
        if (!data || !(menu = JSON.parse(data))) {
            cb(null);
            return;
        };
        menu = menu.button;
        cb(menu);
    });
}; // getMenus()


/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
SimRemote.prototype.kick = function(uid, sid) {
	var channel = this.channelService.getChannel(CH_NAME, false);
	if( !! channel) {
		channel.leave(uid, sid);
	}
};
