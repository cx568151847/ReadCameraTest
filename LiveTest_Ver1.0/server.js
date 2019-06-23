

var express = require('express'),//引入express模块
app = express(),
server = require('http').createServer(app);//引入http模块并创建服务器,以app为参数

server.listen(3000);//绑定3000端口


//req为request，来自客户端的请求
//res为response，服务器对请求的回应
app.get('/', function(req, res) {	
    res.sendfile(__dirname + '/webrtc.html');//传送文件
});

var WebSocketServer = require('ws').Server,//调用websocket模块并引用Server类
wss = new WebSocketServer({server: server});//使用上面的引用实例化，参数为之前设置的http，wss绑定了3000端口

// 存储socket的数组，这里只能有2个socket，每次测试需要重启，否则会出错
var wsc = [],
index = 1;

//当有socket接入时，服务器会对connection事件产生响应,该事件传回一个websocket实例
wss.on('connection', function(ws) {
    console.log('Connection Event');

    // 将socket存入数组
    wsc.push(ws);

    // 记下对方socket在数组中的下标，因为这个测试程序只允许2个socket
    // 所以第一个连入的socket存入0，第二个连入的就是存入1
    // otherIndex就反着来，第一个socket的otherIndex下标为1，第二个socket的otherIndex下标为0
    var otherIndex = index--,
    desc = null;

    if (otherIndex == 1) {
        desc = 'first socket';
    } else {
        desc = 'second socket';
    }

    // 转发收到的消息
    ws.on('message', function(message) {
        var json = JSON.parse(message);
        console.log('received (' + desc + '): ', json);

        wsc[otherIndex].send(message, function (error) {
            if (error) {
                console.log('Send message error (' + desc + '): ', error);
            }
        });
    });
});