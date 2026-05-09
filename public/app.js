const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const statusElement = document.getElementById("status");
const transcriptElement = document.getElementById("transcript");

let peerConnection;
let mediaStream;
let transcript = "";
let partialTranscript = "";

startButton.addEventListener("click", startTranscribing);
stopButton.addEventListener("click", stopTranscribing);

async function startTranscribing() {
  startButton.disabled = true;
  statusElement.textContent = "Connecting...";

  try {
    peerConnection = new RTCPeerConnection();
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, mediaStream);
    });

    const dataChannel = peerConnection.createDataChannel("openai-events");
    dataChannel.addEventListener("open", () => {
      statusElement.textContent = "Listening...";
      stopButton.disabled = false;
    });
    dataChannel.addEventListener("message", handleRealtimeMessage);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const response = await fetch("/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const answer = {
      type: "answer",
      sdp: await response.text(),
    };

    await peerConnection.setRemoteDescription(answer);
  } catch (error) {
    stopTranscribing();
  }
}

function stopTranscribing() {
  mediaStream?.getTracks().forEach((track) => {
    track.stop()
  });
  peerConnection?.close();
  peerConnection = undefined;
  mediaStream = undefined;
  stopButton.disabled = true;
  startButton.disabled = false;
  statusElement.textContent = "Stopped";
}

function handleRealtimeMessage(message) {
  const event = JSON.parse(message.data);

  if (event.type === "conversation.item.input_audio_transcription.delta") {
    partialTranscript += event.delta;
    renderTranscript();
  }

  if (event.type === "conversation.item.input_audio_transcription.completed") {
    transcript += `${event.transcript}\n`;
    partialTranscript = "";
    renderTranscript();
  }
}

function renderTranscript() {
  transcriptElement.value = transcript + partialTranscript;
}
