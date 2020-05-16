var remoteContainer = document.getElementById("whiteboard");
var handleFail = function (err) {
  console.log("Error occured", err);
};
function addVideoStream(streamId) {
  let streamDiv = document.createElement("div"); // Create a new div for every stream
  streamDiv.id = streamId; // Assigning id to div
  streamDiv.style.transform = "rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
  remoteContainer.appendChild(streamDiv);
}
function removeVideoStream(evt) {
  let stream = evt.stream;
  stream.stop();
  let remDiv = document.getElementById("video" + stream.getId());
  remDiv.parentNode.removeChild(remDiv);
  console.log("Remote stream is removed " + stream.getId());
}
function addCanvas(streamId, screen) {
  let canvas = document.createElement("canvas");
  canvas.id = "canvas" + streamId;
  screen.appendChild(canvas);
  let ctx = canvas.getContext("2d");
  let video = document.getElementById("video" + streamId);

  video.addEventListener("loadedmetadata", function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.style.backgroundColor = "ivory";
    canvas.style.position = "absolute !important";
  });

  video.addEventListener(
    "play",
    function () {
      var $this = this; //cache
      (function loop() {
        if (!$this.paused && !$this.ended) {
          ctx.drawImage($this, 0, 0);
          setTimeout(loop, 1000 / 30); // drawing at 30fps
        }
      })();
    },
    0
  );
}
var client = AgoraRTC.createClient({
  mode: "live",
  codec: "h264"
});

// Defines a client for Real Time Communication
function View() {
  var canvasContainer = document.getElementById("canvas-container");
  client.init(
    "b72614399cdf4df484d0c19e83da594e",
    () => console.log("AgoraRTC client initialized"),
    handleFail
  );

  // The client joins the channel
  client.join(
    null,
    "1000",
    null,
    (uid) => {
      //let frameRate = 30;
      console.log("AgoraRTC client initialized");
    },
    handleFail
  );
  client.on("stream-added", function (evt) {
    client.subscribe(evt.stream, handleFail);
  });
  //When you subscribe to a stream
  client.on("stream-subscribed", function (evt) {
    let stream = evt.stream;
    stream.play("vid", { fit: "contain" });
  });
  //When a person is removed from the stream
  client.on("stream-removed", removeVideoStream);
  // client.on('peer-leave',removeVideoStream);
}

function VideoCall() {
  Config = {
    mode: "live",
    codec: "h264"
  };
  handleFail = function (err) {
    console.log("Error!", err);
  };
  var Client = AgoraRTC.createClient(Config);
  Client.init(
    "b72614399cdf4df484d0c19e83da594e",
    console.log("Client has been initialized!"),
    handleFail
  );
  Client.join(
    null,
    "2000",
    null,
    (uid) => {
      let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
      });
      localStream.init(function () {
        //   localStream.play('me', { fit : 'cover'});
        Client.publish(localStream);
      });
    },
    handleFail
  );
  Client.on("Stream Added", function (evt) {
    Client.subscribe(evt.stream, handleFail);
  });
  Client.on("Stream Subscribed", function (evt) {
    let stream = evt.stream;
    stream.play("remote", { fit: "cover" });
  });
  Client.on("Stream Removed", removeVideoStream);
  Client.on("Peer Left", removeVideoStream);
}
