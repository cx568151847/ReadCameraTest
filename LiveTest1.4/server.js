
console.log('Server Start');

var comeindex = 1;//测试用


class Live{
	constructor(ws,pc){
		this.ws = ws;
		this.pc = pc;
		this.stream = null;
		this.liver = null;//直播人
		this.watcher = null;//观看直播人
		this.isliver = null;//是否是直播发起人
		this.heart_time = null;//心跳检查机制
	}
}

LiveArr = [];//存储所有live

//根据参数pc找到对应的ws，返回的是live的index
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
//根据参数ws找到对应的pc，返回的是live的index
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


var express = require('express'),//引入express模块
app = express(),
server = require('http').createServer(app);//引入http模块并创建服务器,以app为参数

server.listen(3000);//绑定3000端口


//req为request，来自客户端的请求
//res为response，服务器对请求的回应
//第一个接入的为

	app.get('/livecreator*', function(req, res) {	
		console.log('=====================sender index:'+comeindex+'====================');
		res.sendFile(__dirname + '/webrtc_S.html');//传送文件
		//res.send({name:123});
		comeindex++;
	});

	app.get('/h', function(req, res) {	
		console.log('=====================receiver index:'+comeindex+'====================');
		res.sendFile(__dirname + '/webrtc_R.html');
		comeindex++;
	});


	var WebSocketServer = require('ws').Server,//调用websocket模块并引用Server类
	wss = new WebSocketServer({server: server});//使用上面的引用实例化，参数为之前设置的http，wss绑定了3000端口

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
	//先暂时使用Live中的sendAnswerFn
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

//参数为liver和stream，为所有观看该liver的观众刷新
function RefreshWatcherStream(liver,stream){
	console.log('===============Refresh Live Wather Stream=========================');
	var watcher_index = null;
	LiveArr.forEach(function(element,index,arr){
		if(!arr[index].isliver&&liver==arr[index].liver){
			console.log('find a liver '+ liver +'\'s watcher');
			arr[index].stream = stream;//记录新的stream号
			changeStream(arr[index].pc,stream);
		}else{
			//console.log('not find liver '+ liver +'\'s watcher');
		}
	});
}

//将原来传输的流替换掉
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
		
		//获得sender，replaceTrack
		//改变发送到接收客户端的Stream
	
		
		
		
//当有socket接入时，服务器会对connection事件产生响应,该事件传回一个websocket实例
	wss.on('connection', function(ws) {
		
		console.log('Connection');

		//为该websocket创建pc
		var newpc = new wrtc.RTCPeerConnection();
		console.log('create new pc');
		var live = new Live(ws,newpc);
		//LiveArr.push(live);
		
		//ontrack事件，当客户端有MediaStream加载到pc上时触发
		newpc.ontrack = function(event){
			//---测试用---
			var pc_index = FindLiveIndexBypc(newpc);
			console.log('client '+pc_index + ' ontrack happen !');
			console.log(event.streams);
			console.log(event.streams[0]);
			//---测试用---
			live.stream = event.streams[0]; //将pc传来的streams存入live						
					}
		
		//为websocket添加close事件监听
		ws.addEventListener('close',handle_close);
			
		function handle_close(event){
			var live_index = FindLiveIndexByws(event.target);//关闭的ws对应的live编号
			console.log('========ws close=========');
			if(live_index != -1){
				console.log('The end liver number is: ' + live_index);
				
				//关闭连接，删除live
				LiveArr[live_index].pc.close();
				LiveArr[live_index].ws.close();
				LiveArr[live_index].pc = null;
				LiveArr[live_index].ws = null;
				LiveArr[live_index].stream = null;
				LiveArr.splice(live_index,1);//从LiveArr中移除该live
				
			}else{
				console.log('Error : a not exist websocket close');
			}
			console.log('========ws close=========');
		}
		
		
		
		//提前绑定好onicecandidate事件 //当发现合适的ICE候选，发送ICE候选到其他客户端	
		newpc.onicecandidate = function(event){
			if (event.candidate !== null) {
				console.log('send ice');
				//找到ice候选后socket发送
				ws.send(JSON.stringify({
					"event": "_ice_candidate",
					"data": {
						"candidate": event.candidate
						}
					}));
				}
			};
			
			
		
		
		//WebSocket收到客户端send的消息时触发
		ws.on('message', function(message) {
			
			
//			console.log('handle msg ws index = ' + FindLiveIndexByws(ws));

			var json = JSON.parse(message);
//			console.log('received : ', json);//输出接收到的消息
		
			if(json.event === "_who"){
				//客户端向服务器发送信息，表明自己是直播发起方还是观看方
				console.log('I know you are ' + json.data + ' name is ' + json.liver);
				
				//是一个发送者
			if(json.data === "sender"){
					live.isliver = true;
					//检查是否已经在直播了
					var index = FindLiveIndexByLiver(json.liver);
					//完全按照liver来进行匹配
					if(index==-1){
						console.log('=======================');
						console.log('==This is a new Liver==');
						console.log('=======================');
						
						live.liver = json.liver;
						//存储到LiveArr
						LiveArr.push(live);
					}else{
						//直播已经存在
						console.log('===========================');
						console.log('==This is not a new Liver==');
						console.log('===========================');
						console.log('this liver index = ' + index);
						//关闭原来直播的pc、ws、stream
						//LiveArr[index].pc.removeStream(LiveArr[index].stream);
						LiveArr[index].pc.close();
						LiveArr[index].ws.close();
						LiveArr[index].pc = null;
						LiveArr[index].ws = null;
						LiveArr[index].stream = null;
						//将新的直播属性加入
						LiveArr[index].liver = json.liver;
						LiveArr[index].pc = live.pc;
						LiveArr[index].ws = live.ws;
						LiveArr[index].watcher = live.watcher;
						LiveArr[index].stream = live.stream;
						LiveArr[index].isliver = live.isliver;
						//刷新观看者的stream
						RefreshWatcherStream(json.liver,LiveArr[index].stream);
						
					}
					//更新index
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
						
						//尝试由服务器来发起offer
						stream.getTracks().forEach(track => live.pc.addTrack(track, stream));

						
						//服务器创建并发送offer,目的是向客户端传输stream
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
			//如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
			console.log('server get and add ice');
            live.pc.addIceCandidate(new wrtc.RTCIceCandidate(json.data.candidate));
        }else {
			console.log('else event');
			console.log(json.event);
			console.log('server set description');
            live.pc.setRemoteDescription(new wrtc.RTCSessionDescription(json.data.sdp));
            // 如果是一个offer，那么需要回复一个answer
            if(json.event === "_offer") {
				console.log('receive offer');
				console.log(json.data);
				console.log('server send answer');
				//修改createAnswer
                /*LiveArr[FindLiveIndexByws(ws)].pc.createAnswer(LiveArr[FindLiveIndexByws(ws)].sendAnswerFn, function (error) {
                    console.log('Failure callback: ' + error);
                });*/
				live.pc.createAnswer().then(function(answer) {
					console.log('create and send answer');
					//return live.pc.setLocalDescription(answer);
					live.pc.setLocalDescription(answer);
					//将Answer发送回客户端
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







