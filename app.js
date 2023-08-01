const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCallButton');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let localStream;
let remoteStream;
let pc1;
let pc2;

startCallButton.addEventListener('click', startCall);

async function startCall() {
    try {
        // Lấy stream từ camera và hiển thị lên localVideo
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Tạo PeerConnection cho máy 1 (pc1)
        pc1 = new RTCPeerConnection();

        // Thêm stream local vào pc1
        localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

        // Tạo Offer sử dụng pc1
        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);

        // Truyền SDP offer qua máy 2 và nhận SDP offer
        const answer = prompt('Copy this SDP offer and paste it to the other machine:', offer.sdp);

        // Tạo PeerConnection cho máy 2 (pc2)
        pc2 = new RTCPeerConnection();

        // Khi nhận được remote ice candidate từ pc2, thêm nó vào pc1
        pc2.addEventListener('icecandidate', event => {
            if (event.candidate) {
                pc1.addIceCandidate(event.candidate);
            }
        });

        // Khi có remote stream từ pc2, hiển thị lên remoteVideo
        pc2.addEventListener('track', event => {
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
        });

        // Tạo SDP answer từ SDP offer của pc1
        await pc2.setRemoteDescription({ type: 'offer', sdp: answer });

        // Tạo SDP answer từ SDP offer của pc2
        const answerDesc = await pc2.createAnswer();
        await pc2.setLocalDescription(answerDesc);

        // Truyền SDP answer qua máy 1 và nhận SDP answer
        const finalAnswer = prompt('Copy this SDP answer and paste it to the other machine:', answerDesc.sdp);
        
        // Thiết lập SDP answer của pc1
        await pc1.setRemoteDescription({ type: 'answer', sdp: finalAnswer });
    } catch (error) {
        console.error('Error starting call:', error);
    }
    // Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
    
}
