��Ϊ�����ʹ����Node.js
��Ҫ��װnpm����������Node.js
��ʵ��WebRTCʾ���е�Websocket Chat�޸ĵ�

npmģ��·��Ϊ
C:\Users\dell\AppData\Roaming\npm\node_modules

ʹ�÷���
E:
cd LiveTest
node server.js
�������ҳ��http://127.0.0.1:3000
�ٴ�ҳ��http://127.0.0.1:3000#true

������ҳ��˫��Ctrl+C�˳�


1.1
��Ϊwebrtc_S��webrtc_R����ҳ�棬���ַ��ͷ��ͽ��շ�
�޸�ҳ�����ݣ�ֻ��һ��video

ʵ���˷�������ʹ��RTCPeerConnection��ͻ���ͨ��
������Ϊ��������û��onaddstream�¼������޷���ȡý����
1.2
�Կͻ��˵�ý�岥�ŷ�ʽ�����˸ı�
video.src��Ϊvideo.srcObject����ʹ��WebRTC��MediaStream����
https://github.com/node-webrtc/node-webrtc-examples/blob/master/examples/audio-video-loopback/client.js
nodejs���ʹ�ÿ����������ҵ�ʾ��

1.3
�ɹ��ڽ��ն���������˽��������ӣ����Ƿ��������޷���ȡ�Ѿ��洢��stream
���ֿ���
1�����Ͷ�û�з��ͳ���
2���������˶�ȡ��ʽ����
������д����-_-||

1.4
���getUserMedia�����޸ģ�ȷ�����ݣ���Ȼ�����⣬������https��ԭ��

�ɹ�ʵ��������ý�����Ĵ���
ʵ����ֱ��������ͬһ�˻��ظ�����ֱ��ʱ��ý�����滻���Լ�ͬʱ��ۿ��ͻ���ý�������滻


��������ʱ��_R��_S�ļ��ڵ�ip��ַ��Ϊ127.0.0.1:3000���ǵ��޸�


