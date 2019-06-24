
console.log('Server Start');

var comeindex = 1;//测试用，第一个接入的为直播方，之后接入的为观看方
var ServerPeerConnection = null;




var express = require('express'),//引入express模块
app = express(),
server = require('http').createServer(app);//引入http模块并创建服务器,以app为参数

server.listen(3000);//绑定3000端口


//req为request，来自客户端的请求
//res为response，服务器对请求的回应
//第一个接入的为
if(comeindex==1){
	app.get('/', function(req, res) {	
		res.sendfile(__dirname + '/webrtc_S.html');//传送文件
	});
	comeindex++;
}else{
	app.get('/', function(req, res) {	
		res.sendfile(__dirname + '/webrtc_R.html');//
	});
}

var WebSocketServer = require('ws').Server,//调用websocket模块并引用Server类
wss = new WebSocketServer({server: server});//使用上面的引用实例化，参数为之前设置的http，wss绑定了3000端口

// 存储socket的数组，这里只能有2个socket，每次测试需要重启，否则会出错
var ReceivedWebSocket = [];
var nowsocketindex = -1;

//服务器端建立pc
var iceServer = {
            "iceServers": [{
                "url": "stun:stun.l.google.com:19302"
            }, {
                "url": "turn:numb.viagenie.ca",
                "username": "webrtc@live.com",
                "credential": "muazkh"
            }]
        };
		
var wrtc = require('wrtc');
console.log(wrtc);
console.log(wrtc.RTCPeerConnection.onaddstream);
ServerPeerConnection = new wrtc.RTCPeerConnection();

	ServerPeerConnection.onaddstream = function(event){
            console.log('Server get Video!!!!!!!!!!!!!!!!!!!!!!!!!');
			//document.getElementById('remoteVideo').src = URL.createObjectURL(event.stream);
        };

		// 发送ICE候选到其他客户端
        ServerPeerConnection.onicecandidate = function(event){
            if (event.candidate !== null) {
				//找到ice候选后socket发送
                ReceivedWebSocket[nowsocketindex].send(JSON.stringify({
                    "event": "_ice_candidate",
                    "data": {
                        "candidate": event.candidate
                    }
                }));
            }
        };

		
        // 发送offer和answer的函数，发送本地session描述
		/*
        var sendOfferFn = function(desc){
            ServerPeerConnection.setLocalDescription(desc);
            socket.send(JSON.stringify({ 
                "event": "_offer",
                "data": {
                    "sdp": desc
                }
            }));
        };*/
        var sendAnswerFn = function(desc){
            ServerPeerConnection.setLocalDescription(desc);
            ReceivedWebSocket[nowsocketindex].send(JSON.stringify({ 
                "event": "_answer",
                "data": {
                    "sdp": desc
                }
            }));
        };


console.log('wait for socket');


//当有socket接入时，服务器会对connection事件产生响应,该事件传回一个websocket实例
wss.on('connection', function(ws) {
    console.log('New Connection');
    // 将socket存入数组
    ReceivedWebSocket.push(ws);
	nowsocketindex++;
	console.log('nowindex：'+nowsocketindex);
	
	
    // 记下对方socket在数组中的下标，因为这个测试程序只允许2个socket
    // 所以第一个连入的socket存入0，第二个连入的就是存入1
    // otherIndex就反着来，第一个socket的otherIndex下标为1，第二个socket的otherIndex下标为0

    // 转发收到的消息
    ws.on('message', function(message) {
        var json = JSON.parse(message);
        console.log('received : ', json);

            //如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
            if( json.event === "_ice_candidate" ){
				console.log('server get ice');
                ServerPeerConnection.addIceCandidate(new wrtc.RTCIceCandidate(json.data.candidate));
            } else {
				console.log('server set description');
                ServerPeerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(json.data.sdp));
                // 如果是一个offer，那么需要回复一个answer
                if(json.event === "_offer") {
					console.log('server send answer');
                    ServerPeerConnection.createAnswer(sendAnswerFn, function (error) {
                        console.log('Failure callback: ' + error);
                    });
                }
            }
			
    });
});