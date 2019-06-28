
console.log('Server Start');

var comeindex = 1;//������


class Live{
	constructor(ws,pc){
		this.ws = ws;
		this.pc = pc;
		this.stream = null;
		this.liver = null;//ֱ����
		this.watcher = null;//�ۿ�ֱ����
		this.isliver = null;//�Ƿ���ֱ��������
		this.heart_time = null;//����������
	}
}

LiveArr = [];//�洢����live

//���ݲ���pc�ҵ���Ӧ��ws�����ص���live��index
function FindLiveIndexBypc(pc){
	var _index = -1;
	LiveArr.forEach(function(element,index,arr){
		if(pc==arr[index].pc){
			_index = index;
			console.log('find same pc index = '+index);
		}else{
			console.log('search for same pc');
		}
	});
	return _index;
}
//���ݲ���ws�ҵ���Ӧ��pc�����ص���live��index
function FindLiveIndexByws(ws){
	var _index = -1;
	LiveArr.forEach(function(element,index,arr){
		if(ws==arr[index].ws){
			_index = index;
			console.log('find same ws index = '+index);
		}else{
			console.log('search for same ws');
		}
	});
	return _index;
}

function FindLiveIndexByLiver(liver){
	console.log('target liver : ' + liver);
	var _index = -1;
	LiveArr.forEach(function(element,index,arr){
		if(arr[index].isliver&&liver==arr[index].liver){
			_index = index;
			console.log('find liver, index = '+index);
		}else{
			console.log('search for liver; now : '+arr[index].liver);
		}
		//console.log(arr[index]);
	});
	return _index;
}


var express = require('express'),//����expressģ��
app = express(),
server = require('http').createServer(app);//����httpģ�鲢����������,��appΪ����

server.listen(3000);//��3000�˿�


//reqΪrequest�����Կͻ��˵�����
//resΪresponse��������������Ļ�Ӧ
//��һ�������Ϊ

	app.get('/livecreator*', function(req, res) {	
		console.log('=====================sender index:'+comeindex+'====================');
		res.sendFile(__dirname + '/webrtc_S.html');//�����ļ�
		//res.send({name:123});
		comeindex++;
	});

	app.get('/h', function(req, res) {	
		console.log('=====================receiver index:'+comeindex+'====================');
		res.sendFile(__dirname + '/webrtc_R.html');
		comeindex++;
	});


	var WebSocketServer = require('ws').Server,//����websocketģ�鲢����Server��
	wss = new WebSocketServer({server: server});//ʹ�����������ʵ����������Ϊ֮ǰ���õ�http��wss����3000�˿�

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
	
	/*
	sendAnswerFn(desc){
            this.pc.setLocalDescription(desc);
            this.websocket.send(JSON.stringify({ 
                "event": "_answer",
                "data": {
                    "sdp": desc
                }
            }));
    };
	*/


	/*
	//����ʱʹ��Live�е�sendAnswerFn
        var sendAnswerFn = function(desc){
            ServerPeerConnection.setLocalDescription(desc);
            ReceivedWebSocket[nowsocketindex].send(JSON.stringify({ 
                "event": "_answer",
                "data": {
                    "sdp": desc
                }
            }));
        };
*/
		

console.log('wait for socket');

//����Ϊliver��stream��Ϊ���йۿ���liver�Ĺ���ˢ��
function RefreshWatcherStream(liver,stream){
	console.log('===============Refresh Live Wather Stream=========================');
	var watcher_index = null;
	LiveArr.forEach(function(element,index,arr){
		if(!arr[index].isliver&&liver==arr[index].liver){
			console.log('find a liver '+ liver +'\'s watcher');
			arr[index].stream = stream;//��¼�µ�stream��
			changeStream(arr[index].pc,stream);
		}else{
			//console.log('not find liver '+ liver +'\'s watcher');
		}
	});
}

//��ԭ����������滻��
function changeStream(pc,newstream){
		console.log('pc.getSenders');
		console.log(pc.getSenders());
		console.log('newstream track');
		console.log(newstream.getTracks());
		console.log('newstream track');
		//console.log(newstream.getTracks().forEach(track => console.log(track)));

		newstream.getTracks().forEach(videoTrack => {
			pc.getSenders().find(function(rtpsender) {
				if(rtpsender.track.kind == videoTrack.kind){
					console.log('replace track ! ');
					rtpsender.replaceTrack(videoTrack);
				}else{
					//console.log('not find same kind track ! ');
				}
			});
		});
	}


	function showLiveArr(){
		console.log('-------now LiveArr-------');
			for(var i=0;i<LiveArr.length;i++){
				console.log('-------live '+i+'------------');
				console.log(LiveArr[i].liver);
				console.log(LiveArr[i].isliver);
				console.log(LiveArr[i].stream);
			}
			console.log('-------now LiveArr-------');
		}
		
		//���sender��replaceTrack
		//�ı䷢�͵����տͻ��˵�Stream
	
		
		
		
//����socket����ʱ�����������connection�¼�������Ӧ,���¼�����һ��websocketʵ��
	wss.on('connection', function(ws) {
		
		console.log('Connection');

		//Ϊ��websocket����pc
		var newpc = new wrtc.RTCPeerConnection();
		console.log('create new pc');
		var live = new Live(ws,newpc);
		//LiveArr.push(live);
		
		//ontrack�¼������ͻ�����MediaStream���ص�pc��ʱ����
		newpc.ontrack = function(event){
			//---������---
			var pc_index = FindLiveIndexBypc(newpc);
			console.log('client '+pc_index + ' ontrack happen !');
			console.log(event.streams);
			console.log(event.streams[0]);
			//---������---
			live.stream = event.streams[0]; //��pc������streams����live						
					}
		
		//Ϊwebsocket���close�¼�����
		ws.addEventListener('close',handle_close);
			
		function handle_close(event){
			var live_index = FindLiveIndexByws(event.target);//�رյ�ws��Ӧ��live���
			console.log('========ws close=========');
			if(live_index != -1){
				console.log('The end liver number is: ' + live_index);
				
				//�ر����ӣ�ɾ��live
				LiveArr[live_index].pc.close();
				LiveArr[live_index].ws.close();
				LiveArr[live_index].pc = null;
				LiveArr[live_index].ws = null;
				LiveArr[live_index].stream = null;
				LiveArr.splice(live_index,1);//��LiveArr���Ƴ���live
				
			}else{
				console.log('Error : a not exist websocket close');
			}
			console.log('========ws close=========');
		}
		
		
		
		//��ǰ�󶨺�onicecandidate�¼� //�����ֺ��ʵ�ICE��ѡ������ICE��ѡ�������ͻ���	
		newpc.onicecandidate = function(event){
			if (event.candidate !== null) {
				console.log('send ice');
				//�ҵ�ice��ѡ��socket����
				ws.send(JSON.stringify({
					"event": "_ice_candidate",
					"data": {
						"candidate": event.candidate
						}
					}));
				}
			};
			
			
		
		
		//WebSocket�յ��ͻ���send����Ϣʱ����
		ws.on('message', function(message) {
			
			
//			console.log('handle msg ws index = ' + FindLiveIndexByws(ws));

			var json = JSON.parse(message);
//			console.log('received : ', json);//������յ�����Ϣ
		
			if(json.event === "_who"){
				//�ͻ����������������Ϣ�������Լ���ֱ�����𷽻��ǹۿ���
				console.log('I know you are ' + json.data + ' name is ' + json.liver);
				
				//��һ��������
			if(json.data === "sender"){
					live.isliver = true;
					//����Ƿ��Ѿ���ֱ����
					var index = FindLiveIndexByLiver(json.liver);
					//��ȫ����liver������ƥ��
					if(index==-1){
						console.log('=======================');
						console.log('==This is a new Liver==');
						console.log('=======================');
						
						live.liver = json.liver;
						//�洢��LiveArr
						LiveArr.push(live);
					}else{
						//ֱ���Ѿ�����
						console.log('===========================');
						console.log('==This is not a new Liver==');
						console.log('===========================');
						console.log('this liver index = ' + index);
						//�ر�ԭ��ֱ����pc��ws��stream
						//LiveArr[index].pc.removeStream(LiveArr[index].stream);
						LiveArr[index].pc.close();
						LiveArr[index].ws.close();
						LiveArr[index].pc = null;
						LiveArr[index].ws = null;
						LiveArr[index].stream = null;
						//���µ�ֱ�����Լ���
						LiveArr[index].liver = json.liver;
						LiveArr[index].pc = live.pc;
						LiveArr[index].ws = live.ws;
						LiveArr[index].watcher = live.watcher;
						LiveArr[index].stream = live.stream;
						LiveArr[index].isliver = live.isliver;
						//ˢ�¹ۿ��ߵ�stream
						RefreshWatcherStream(json.liver,LiveArr[index].stream);
						
					}
					//����index
					//index = FindLiveIndexByLiver(json.liver);
					//console.log('Final Index = '+index);
	
				}else if(json.data === "receiver"){
					console.log('you want to watch '+json.liver);
					live.isliver = false;
					live.liver = json.liver;
					live.watcher = json.watcher;
					var liver_index = FindLiveIndexByLiver(json.liver);
					if(liver_index == -1){
						console.log('===========================');
						console.log('not find the liver you want');
						console.log('===========================');
					}else{
						console.log('===========================');
						console.log('find liver, transfer will start');
						console.log('===========================');
						
						var stream = LiveArr[liver_index].stream;
						live.stream = LiveArr[liver_index].stream;
						//console.log(stream);
						//stream.getTracks().forEach(track => live.pc.addTrack(track, stream));
						//console.log('stream add to track');
						
						//�����ɷ�����������offer
						stream.getTracks().forEach(track => live.pc.addTrack(track, stream));

						
						//����������������offer,Ŀ������ͻ��˴���stream
						console.log('send offer');
						live.pc.createOffer().then(function(offer) {
							return live.pc.setLocalDescription(offer);
						})
						.then(function() {
							live.ws.send(JSON.stringify({ 
								"event": "_offer",
								"data": {
									"sdp": live.pc.localDescription
								}
							}));
						})
						.catch(function(error) {
							console.log('error in createoffer : '+error);
						});
						LiveArr.push(live);
					}
					

				}else{
					console.log('can\'t know is sender or receiver');
					live.isliver = false;
				}
				
				
				showLiveArr();
				
				
		}else if( json.event === "_ice_candidate" ){
			//�����һ��ICE�ĺ�ѡ��������뵽PeerConnection�У������趨�Է���session����Ϊ���ݹ���������
			console.log('server get and add ice');
            live.pc.addIceCandidate(new wrtc.RTCIceCandidate(json.data.candidate));
        }else {
			console.log('else event');
			console.log(json.event);
			console.log('server set description');
            live.pc.setRemoteDescription(new wrtc.RTCSessionDescription(json.data.sdp));
            // �����һ��offer����ô��Ҫ�ظ�һ��answer
            if(json.event === "_offer") {
				console.log('receive offer');
				console.log(json.data);
				console.log('server send answer');
				//�޸�createAnswer
                /*LiveArr[FindLiveIndexByws(ws)].pc.createAnswer(LiveArr[FindLiveIndexByws(ws)].sendAnswerFn, function (error) {
                    console.log('Failure callback: ' + error);
                });*/
				live.pc.createAnswer().then(function(answer) {
					console.log('create and send answer');
					//return live.pc.setLocalDescription(answer);
					live.pc.setLocalDescription(answer);
					//��Answer���ͻؿͻ���
					live.ws.send(JSON.stringify({ 
						"event": "_answer",
						"data": {
							"sdp": answer
						}
					}));
				})
				.catch(function (error) {
                    console.log('Failure callback: ' + error);
                });
				console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
				console.log('ice GatheringState and ConnectionState');
				console.log(live.pc.iceGatheringState);
				console.log(live.pc.iceConnectionState);
				console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
            }
        }
		
	});
				
});




	function checkLiveHeartTime(){
		LiveArr.forEach(function(element,index,arr){
				
					

		});
		
	}
		function now_ws_state(){
			
			if(LiveArr.length>=2){
				console.log('now Senders: ');
				var senderArr = LiveArr[1].pc.getSenders();
				senderArr.forEach(function(element,index,arr){
					console.log(arr[index].track.kind);
					
					
				});
				
			}
			setTimeout(now_ws_state,5000);
		}
		//setTimeout(now_ws_state,5000);







