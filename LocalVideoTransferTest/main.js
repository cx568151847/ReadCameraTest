(function() {

  // Define "global" variables
  
  var connectButton = null;
  var disconnectButton = null;
  var sendButton = null;
  var messageInputBox = null;
  var receiveBox = null;
  
  var localConnection = null;   // RTCPeerConnection for our "local" connection
  var remoteConnection = null;  // RTCPeerConnection for the "remote"
  
  var sendChannel = null;       // RTCDataChannel for the local (sender)
  var receiveChannel = null;    // RTCDataChannel for the remote (receiver)
  var video1_stream = null;
  
  // ReadCamera配置设置
  var mediaOpts = {
	audio: false,
    video: true,
    // video: { width: 1280, height: 720 }
	// video: { facingMode: "environment"}, // 或者 "user"
  }
  // Functions
  
  //Camera调用成功
	function successFunc(stream) {
		var video = document.getElementById('video1');
		if ("srcObject" in video) {
			video1_stream = stream;//video1_stream存储视频流，用于发送给接收方
			video.srcObject = video1_stream
		} else {
			video.src = window.URL && window.URL.createObjectURL(stream) || stream
		}
		video.play();
	}
	//调用Camera失败
	function errorFunc(err) {
		alert("Fail to get camera "+err.name);
		console.log("Fail to get camera "+err);
	}
	function readCamera(){
		
		
	}
  // Set things up, connect event listeners, etc.
  
  function startup() {
    connectButton = document.getElementById('connectButton');
    disconnectButton = document.getElementById('disconnectButton');
    sendButton = document.getElementById('sendButton');
    messageInputBox = document.getElementById('message');
    receiveBox = document.getElementById('receivebox');

    // Set event listeners for user interface widgets

    connectButton.addEventListener('click', connectPeers, false);
    disconnectButton.addEventListener('click', disconnectPeers, false);
    sendButton.addEventListener('click', sendMessage, false);
	
	//用于兼容
	//window.URL = (window.URL || window.webkitURL || window.mozURL || window.msURL);
	if (navigator.mediaDevices === undefined) {
		navigator.mediaDevices = {};
	}
	if (navigator.mediaDevices.getUserMedia === undefined) {
		navigator.mediaDevices.getUserMedia = function(constraints) {
			var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			if (!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}
			return new Promise(function(resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		}
	}
	//启动摄像头
	navigator.mediaDevices.getUserMedia(mediaOpts).then(successFunc).catch(errorFunc);
  }
  
  // Connect the two peers. Normally you look for and connect to a remote
  // machine here, but we're just connecting two local objects, so we can
  // bypass that step.
 
  
  function connectPeers() {
    // Create the local connection and its event listeners
    
    localConnection = new RTCPeerConnection();
    
    // Create the data channel and establish its event listeners
    sendChannel = localConnection.createDataChannel("sendChannel");//建立发送方的数据通道
    sendChannel.onopen = handleSendChannelStatusChange;//为数据通道添加监听事件
    sendChannel.onclose = handleSendChannelStatusChange;
    
    // Create the remote connection and its event listeners
    
    remoteConnection = new RTCPeerConnection();//建立接收方的数据通道
    remoteConnection.ondatachannel = receiveChannelCallback;//接收方数据通道添加监听事件 当双方建立WebRTC连接时调用
    
    // Set up the ICE candidates for the two peers
	//交互式连通性建立（Interactive Connectivity Establishment）ICE 实时等端发现对方并连接的框架 发现本地对等端所有可能的IP与端口的组合
    //这里省略了网络传输过程，通常是通过UDP、TCP、中继或其他的什么方法，双方互传ICE候选，这里直接设置
	
    localConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
	   .catch(handleAddCandidateError);
	

    remoteConnection.onicecandidate = e => !e.candidate
        || localConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);
    
	
	
	localConnection.addStream(video1_stream);//视频流需要提前add 如果本地端与远端协调已经发生了，那么需要一个新的媒体流，这样远端才可以使用它。虽然目前可以使用，但该方法已经从最新规范中被移除
	
	
    // Now create an offer to connect; this starts the process
    //创建SDP块（Session Description Protocol）用于描述想要建立的连接 createOffer可以添加约束（如是否支持音频视频）
    localConnection.createOffer()
    .then(offer => localConnection.setLocalDescription(offer))//offer传给本地
    .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))//接收方收到发送方的SDP块设置
    .then(() => remoteConnection.createAnswer())
    .then(answer => remoteConnection.setLocalDescription(answer))//接收方同样创建SDP块回应发送方的连接请求
    .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))//发送方收到接收方传来的SDP块并设置
    .catch(handleCreateDescriptionError);
	
  }
    
  // Handle errors attempting to create a description;
  // this can happen both when creating an offer and when
  // creating an answer. In this simple example, we handle
  // both the same way.
  
  function handleCreateDescriptionError(error) {
    console.log("Unable to create an offer: " + error.toString());
  }
  
  // Handle successful addition of the ICE candidate
  // on the "local" end of the connection.
  //实际上没有使用这下面两个函数 因为他们的工作在handleSendChannelStatusChange被完成了
  function handleLocalAddCandidateSuccess() {
    connectButton.disabled = true;
  }

  // Handle successful addition of the ICE candidate
  // on the "remote" end of the connection.
  
  function handleRemoteAddCandidateSuccess() {
    disconnectButton.disabled = false;
  }

  // Handle an error that occurs during addition of ICE candidate.
  
  function handleAddCandidateError() {
    console.log("Oh noes! addICECandidate failed!");
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.
  //发送方发送信息
  function sendMessage() {
    var message = messageInputBox.value;
    sendChannel.send(message);//数据通道的send函数向接收方发送数据

    
    // Clear the input box and re-focus it, so that we're
    // ready for the next message.
    
    messageInputBox.value = "";
    messageInputBox.focus();
  }
  
  // Handle status changes on the local end of the data
  // channel; this is the end doing the sending of data
  // in this example.
  
  function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;
    
      if (state === "open") {
        messageInputBox.disabled = false;
        messageInputBox.focus();
        sendButton.disabled = false;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
      } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      }
    }
  }
  
  // Called when the connection opens and the data
  // channel is ready to be connected to the remote.
  //接收方数据通道接收到发送方发送来的函数 由ondatachannel事件触发 但实际上这个事件触发时数据通道还没有open
  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
	
	var video = document.getElementById('video2');
	var array = remoteConnection.getRemoteStreams(); //接收方remoteConnection收到发送方localConnection发来的媒体流并在video2上播放
	console.log("接收方收到视频流getRemoteStreams：");
	console.log(array);
	if(array.length>0){
		video.srcObject = array[0];
		video.play();
	}
	
  }
  
  // Handle onmessage events for the receiving channel.
  // These are the data messages sent by the sending channel.
  //处理接收到的数据
  function handleReceiveMessage(event) {
    var el = document.createElement("p");
    var txtNode = document.createTextNode(event.data);
    
    el.appendChild(txtNode);
    receiveBox.appendChild(el);
  }
  
  // Handle status changes on the receiver's channel.
  //接收方通道状态改变
  function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  receiveChannel.readyState);
    }
    
    // Here you would do stuff that needs to be done
    // when the channel's status changes.
  }
  
  // Close the connection, including data channels if they're open.
  // Also update the UI to reflect the disconnected status.
  //断开连接
  function disconnectPeers() {
  
    // Close the RTCDataChannels if they're open.
    //关闭双方数据通道
    sendChannel.close();
    receiveChannel.close();
    
    // Close the RTCPeerConnections
    //关闭双方RTC连接
    localConnection.close();
    remoteConnection.close();

    sendChannel = null;
    receiveChannel = null;
    localConnection = null;
    remoteConnection = null;
    
    // Update user interface elements
    
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sendButton.disabled = true;
    
    messageInputBox.value = "";
    messageInputBox.disabled = true;
  }
  
  // Set up an event listener which will run the startup
  // function once the page is done loading.
  
  window.addEventListener('load', startup, false);
})();
