var pomelo = window.pomelo;
var username;
var menus;
var rid;
var base = 10000000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

util = {
    now: function(){
        return moment().format('YYYY-MM-DD HH:m:ss');
    },

	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	//  html sanitizer
	toStaticHTML: function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	//pads n with zeros on the left,
	//digits is minimum length of output
	//zeroPad(3, 5); returns "005"
	//zeroPad(2, 500); returns "500"
	zeroPad: function(digits, n) {
		n = n.toString();
		while(n.length < digits)
		n = '0' + n;
		return n;
	},
	//it is almost 8 o'clock PM here
	//timeString(new Date); returns "19:49"
	timeString: function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	//does the argument only contain whitespace?
	isBlank: function(text) {
		var blank = /^\s*$/;
		return(text.match(blank) !== null);
	}
};

//always view the most recent message when it is added
function scrollDown(base) {
	window.scrollTo(0, base);
	$("#entry").focus();
};

// add message on board
function addMessage(from, text) {
	if(text === null) return;
	var msgElem = $(document.createElement("div"));
	text = util.toStaticHTML(text);
	var content = util.now() + ' | ' + util.toStaticHTML(from) + text + '<br/>';
	msgElem.html(content);
    add_msg_elem(msgElem);
};

function add_msg_elem(elem){
	$("#chatHistory").append(elem);
	scrollDown(base);
}

// show tip
function tip(type, name) {
	var tip,title;
	switch(type){
		case 'online':
			tip = name + ' is online now.';
			title = 'Online Notify';
			break;
		case 'offline':
			tip = name + ' is offline now.';
			title = 'Offline Notify';
			break;
		case 'message':
			tip = name + ' is saying now.'
			title = 'Message Notify';
			break;
	}
    console.log('title: ' + title);
    console.log('tip: ' + tip);
//	var pop=new Pop(title, tip);
};


function showMenus(data) {
	menus = data.menus;
    console.dir(menus);
    var $m = $('#menu');
    $m.empty();
    var menu_str = '<dl><dt><a href="javascript:on_sub();">订阅</a></dt></dl>';
    for (var i = 0; i < menus.length; i++) {
        var m = menus[i];
        var href = 'javascript:void(0);';
        var dd = gen_sub_menus(m);
        if (!dd) {
            href = 'javascript:on_menu(\'' + m.key + '\', \'' + m.name + '\');';
        };
        var dt = '<dt><a href="' + href + '">' + m.name + '</a></dt>';
        menu_str += '<dl>' + dt + dd + '</dl>';
    };
    $m.append(menu_str);
    init_menu();
}; // showMenus()

function on_menu(key, name){
    send_msg('CLICK', key, name);
}

function on_sub(){
    send_msg('subscribe', '', '订阅');
}

function gen_sub_menus(m){
    if (!m.sub_button) {
        return '';
    };
    var ret = '';
    var subs = m.sub_button;
    for (var i = 0; i < subs.length; i++) {
        var sub = subs[i];
        ret += '<A href="javascript:on_menu(\'' + sub.key + '\', \'' + sub.name + '\');"><span>' + sub.name + '</span></A>'
    };
    if (!ret) {return ret;}
    ret = '<dd>' + ret + '</dd>';
    return ret;
}; // gen_sub_menus()


// show error
function showError(content) {
	$("#loginError").text(content);
	$("#loginError").show();
};

// show login panel
function showLogin() {
	$("#loginView").show();
	$("#chatHistory").hide();
	$("#toolbar").hide();
	$("#loginError").hide();
	$("#loginUser").focus();
};

// show chat panel
function showChat() {
	$("#loginError").hide();
	$("#toolbar").show();
	$("entry").focus();
	scrollDown(base);
};

// query connector
function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			pomelo.disconnect();
			if(data.code === 500) {
				showError(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
};

function login(){
    var username = Math.random();
    var rid = 1;
    queryEntry(username, function(host, port) {
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function() {
            pomelo.request("connector.entryHandler.enter", {
                username: username,
                rid: rid
            }, function(data) {
                if(data.error) {
                    showError(DUPLICATE_ERROR);
                    return;
                }
                showChat();
                showMenus(data);
            });
        });
    });
};


$(document).ready(function() {
    login();

	//wait message from the server.
	pomelo.on('onChat', function(data) {
		addMessage('公众号返回:', data.msg);
		$("#chatHistory").show();
	});

	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
		showLogin();
	});

	//deal with chat mode.
	$("#entry").keypress(function(e) {
		if(e.keyCode != 13 ) { return; }
		var msg = $("#entry").attr("value").replace("\n", "");
		if(!util.isBlank(msg)) {
            send_msg(msg);
		}
	});
});


var show_reply = function(json){
	var msgElem = $(document.createElement("div"));
    var msg = util.now() + ' | 系统回复<br/>';
    if(json.Articles){
        var lst = json.Articles.item;
        msg += '====== 多图文 ======<br/>';
        for (var i = 0; i < lst.length; i++) {
            var item = lst[i];
            msg += '标题: ' + item.Title + '<br/>';
            msg += '摘要: ' + item.Description + '<br/>';
            msg += '图片: <a style="color:blue;" href="' + item.PicUrl +'">' + item.PicUrl + '</a><br/>';
            msg += '链接: <a style="color:blue;" href="' + item.Url + '">' + item.Url + '</a><br/>';
        };
    }else if(json.Content){
        msg += '====== 文本 ======<br/>';
        msg += json.Content.replace(/\n/ig, '<br/>'); 
    }else if(json.Music){
        msg += '====== 音乐 ======<br/>';
        var item = json.Music[0];
        msg += '标题: ' + item.Title + '<br/>';
        msg += '摘要: ' + item.Description + '<br/>';
        msg += '高音质URL: ' + item.HQMusicUrl + '<br/>';
        msg += '低音质URL: : <a href="' + item.MusicUrl + '">' + item.MusicUrl + '</a><br/>';
    }
    msg += '<br/><br/><br/>';
    msgElem.html(msg);
    add_msg_elem(msgElem);
}; // show_reply()

var send_msg = function(evt, evt_key, menu_name){
    $("#entry").attr("value", ""); // clear the entry field.
    var params;
    if (arguments.length > 1) {
        params = {evt: evt, evt_key: evt_key};
        addMessage('你点击了菜单:', menu_name);
    }else{
        params = {content: evt};
        addMessage('你发送了:', evt);
    }
    $("#chatHistory").show();
    pomelo.request('sim.simHandler.send', params, function(data) {
        show_reply(data.res);
    });
} // send_msg()
