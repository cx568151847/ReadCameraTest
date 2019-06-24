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

其中node_modules含有：
express
express generator
ws
wrtc
