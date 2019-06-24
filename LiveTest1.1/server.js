
console.log('Server Start');

var comeindex = 1;//�����ã���һ�������Ϊֱ������֮������Ϊ�ۿ���
var ServerPeerConnection = null;




var express = require('express'),//����expressģ��
app = express(),
server = require('http').createServer(app);//����httpģ�鲢����������,��appΪ����

server.listen(3000);//��3000�˿�


//reqΪrequest�����Կͻ��˵�����
//resΪresponse��������������Ļ�Ӧ
//��һ�������Ϊ
if(comeindex==1){
	app.get('/', function(req, res) {	
		res.sendfile(__dirname + '/webrtc_S.html');//�����ļ�
	});
	comeindex++;
}else{
	app.get('/', function(req, res) {	
		res.sendfile(__dirname + '/webrtc_R.html');//
	});
}

var WebSocketServer = require('ws').Server,//����websocketģ�鲢����Server��
wss = new WebSocketServer({server: server});//ʹ�����������ʵ����������Ϊ֮ǰ���õ�http��wss����3000�˿�

// �洢socket�����飬����ֻ����2��socket��ÿ�β�����Ҫ��������������
var ReceivedWebSocket = [];
var nowsocketindex = -1;

//�������˽���pc
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

		// ����ICE��ѡ�������ͻ���
        ServerPeerConnection.onicecandidate = function(event){
            if (event.candidate !== null) {
				//�ҵ�ice��ѡ��socket����
                ReceivedWebSocket[nowsocketindex].send(JSON.stringify({
                    "event": "_ice_candidate",
                    "data": {
                        "candidate": event.candidate
                    }
                }));
            }
        };

		
        // ����offer��answer�ĺ��������ͱ���session����
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


//����socket����ʱ�����������connection�¼�������Ӧ,���¼�����һ��websocketʵ��
wss.on('connection', function(ws) {
    console.log('New Connection');
    // ��socket��������
    ReceivedWebSocket.push(ws);
	nowsocketindex++;
	console.log('nowindex��'+nowsocketindex);
	
	
    // ���¶Է�socket�������е��±꣬��Ϊ������Գ���ֻ����2��socket
    // ���Ե�һ�������socket����0���ڶ�������ľ��Ǵ���1
    // otherIndex�ͷ���������һ��socket��otherIndex�±�Ϊ1���ڶ���socket��otherIndex�±�Ϊ0

    // ת���յ�����Ϣ
    ws.on('message', function(message) {
        var json = JSON.parse(message);
        console.log('received : ', json);

            //�����һ��ICE�ĺ�ѡ��������뵽PeerConnection�У������趨�Է���session����Ϊ���ݹ���������
            if( json.event === "_ice_candidate" ){
				console.log('server get ice');
                ServerPeerConnection.addIceCandidate(new wrtc.RTCIceCandidate(json.data.candidate));
            } else {
				console.log('server set description');
                ServerPeerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(json.data.sdp));
                // �����һ��offer����ô��Ҫ�ظ�һ��answer
                if(json.event === "_offer") {
					console.log('server send answer');
                    ServerPeerConnection.createAnswer(sendAnswerFn, function (error) {
                        console.log('Failure callback: ' + error);
                    });
                }
            }
			
    });
});