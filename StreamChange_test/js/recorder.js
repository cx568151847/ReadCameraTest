

  var videoPlay = document.getElementById('video');
  var videoPlay_Continue = document.getElementById('videoPlay_Continue');
  var filereader = new FileReader();

  var timecell = 1000;//间隔为1秒


  //检测可用的格式
  var types = ["video/webm", 
             "audio/webm", 
             "video/webm\;codecs=vp8", 
             "video/webm\;codecs=daala", 
             "video/webm\;codecs=h264", 
             "audio/webm\;codecs=opus", 
             "video/mpeg"];

	for (var i in types) { 
		console.log( "Type " + types[i] + " is" + (MediaRecorder.isTypeSupported(types[i]) ? " support " : " not support")); 
	}



    if (navigator.mediaDevices) {
		console.log('getUserMedia supported.');

  var constraints = { 
	audio: true,
	video: true
	};


  
  //使用MediaSource播放blob
	 var mediasource = new MediaSource;
	 var sourcebuffer;
	 //var arr = [];
	  mediasource.addEventListener('error',function(e){
		console.log('error at mediasource:'+e);
	  });
	  
	  videoPlay_Continue.src = URL.createObjectURL(mediasource);
	  

	  mediasource.addEventListener('sourceopen',function(e){
		
	  
		sourcebuffer = mediasource.addSourceBuffer('video/webm; codecs=opus,vp9');
		sourcebuffer.mode = 'sequence';//不然需要添加时间戳
		sourcebuffer.onerror = function(error){
			console.log('==============error occured :'+error);
		}
		});
		
		
		
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
		//初始化MediaRecord
		var record_options = {
			//audioBitsPerSecond:128000,
			//videoBitsPerSecond:2500000,
			mimeType:'video/webm; codecs=opus,vp9'
		}
		var mediaRecorder = new MediaRecorder(stream,record_options);
		mediaRecorder.ondataavailable = function(e) {
			if(e.data.size>0){
				
				//arr.push(e.data);
				//var blob = new Blob(arr,{ 'type' : 'video/webm; codecs=opus,vp9' });
				//console.log(blob);
				
				var reader = new FileReader();
				reader.readAsArrayBuffer(e.data);
				//reader.readAsArrayBuffer(blob);
				
				reader.onloadend = function(e){
					console.log(reader.result);
					sourcebuffer.appendBuffer(reader.result);
					sourcebuffer.addEventListener('updateend',function(){
						
					});
					
				
				}
				
				
			}
		}

	
	videoPlay.srcObject = stream;
	videoPlay.play();
	
	var record = document.getElementById('record');
	var stop = document.getElementById('stop');
	//录制按钮
    record.onclick = function() {
		//检查是否已经开始录制
	  if(mediaRecorder.state=='recording'){
		console.log('no way');
		return;
	  }
      mediaRecorder.start(timecell);//可以在参数中设置切片时间
	  console.log('mediaRecorder state:');
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";
      record.style.color = "black";
    }
	//停止录制按钮
    stop.onclick = function() {
		//检查是否已经停止录制
	  if(mediaRecorder.state=='inactive'){
		console.log('no way');
		return;
	  }
      mediaRecorder.stop();
	  
      record.style.background = "";
      record.style.color = "";
    }

	
    mediaRecorder.onstop = function(e) {
	  console.log('Record onstop');
    }

  })
  .catch(function(err) {
    console.log('The following error occured: ' + err);
  })
}