var exp = module.exports;


exp.load_x = function(app, path){
    var fs = require('fs');
    var _ = require('underscore');
    _.each(fs.readdirSync(path), function(x){
        var util = require(path+'/'+x);
        util.name = util.name ? util.name : x.split('.')[0];
        app[util.name] = util;
    });
};

exp.initLoad = function(app) {
    app.conf = require('./config/config.js');
    exp.load_x(app, './app/util/');
};
