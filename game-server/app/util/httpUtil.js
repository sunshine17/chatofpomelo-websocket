var exp = module.exports;
exp.name = 'httpUtil';

exp.invokeCallback = function(cb) {
    if (!!cb && typeof cb == 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }         
};

exp.curlGet = function(url, cb){ 
    var req = require('http').request(url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            exp.invokeCallback(cb, null, chunk);
        });  
    });  
    req.on('error', function(e) {
        exp.invokeCallback(cb, e.message, null);
    });  
    req.end();
}; // curlGet()
