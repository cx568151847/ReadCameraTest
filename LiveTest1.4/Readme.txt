因为服务端使用了Node.js
需要安装npm服务来启动Node.js
其实是WebRTC示例中的Websocket Chat修改的

npm模块路径为
C:\Users\dell\AppData\Roaming\npm\node_modules

使用方法
E:
cd LiveTest
node server.js
启动后打开页面http://127.0.0.1:3000
再打开页面http://127.0.0.1:3000#true

命令行页面双击Ctrl+C退出


1.1
分为webrtc_S和webrtc_R两个页面，区分发送方和接收方
修改页面内容，只有一个video

实现了服务器端使用RTCPeerConnection与客户端通信
但是因为服务器端没有onaddstream事件所以无法读取媒体流
1.2
对客户端的媒体播放方式作出了改变
video.src改为video.srcObject，即使用WebRTC的MediaStream对象
https://github.com/node-webrtc/node-webrtc-examples/blob/master/examples/audio-video-loopback/client.js
nodejs如何使用可以在这里找到示例

1.3
成功在接收端与服务器端建立了连接，但是服务器端无法读取已经存储的stream
两种可能
1、发送端没有发送出来
2、服务器端读取格式不对
变量名写错了-_-||

1.4
针对getUserMedia做出修改，确保兼容，仍然有问题，可能是https的原因

成功实现了两端媒体流的传送
实现了直播创立者同一账户重复创建直播时的媒体流替换，以及同时向观看客户端媒体流的替换


本机测试时，_R和_S文件内的ip地址都为127.0.0.1:3000，记得修改


