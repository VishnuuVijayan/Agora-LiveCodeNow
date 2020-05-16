const list = [];
var localmute;
var flagall = false;
var flagme = false;
config = {
  mode: "live",
  codec: "h264"
};
// BEGIN
function removeVideoStream(evt) {
  let stream = evt.stream;
  stream.stop();
  console.log("Remote stream is removed " + stream.getId());
}
// END
function Tog() {
  var whiteboard = document.getElementById("whiteboard");
  var pen = document.getElementById("pen");
  var eraser = document.getElementById("eraser");
  if (whiteboard.style.display == "none") {
    whiteboard.style.display = "block";
    pen.style.display = "inline-block";
    eraser.style.display = "inline-block";

    View();
  } else {
    whiteboard.style.display = "none";
    pen.style.display = "none";
    eraser.style.display = "none";
  }
}
function View() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  canvas.style.height = "40vh";
  canvas.style.width = "40vw";
  canvas.height = 250;
  canvas.width = 500;
  let colorInput = document.querySelector("#color");
  let hexInput = document.querySelector("#hex");
  colorInput.addEventListener("input", () => {
    let color = colorInput.value;
    hexInput.value = color;
    ctx.strokeStyle = hexInput.value;
  });
  var lastX;
  var lastY;
  var strokeColor = "red";
  var strokeWidth = 5;
  var mouseX;
  var mouseY;
  var canvasOffset = $("#canvas").offset();
  var offsetX = canvasOffset.left;
  var offsetY = canvasOffset.top;
  var isMouseDown = false;

  function handleMouseDown(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mousedown stuff here
    lastX = mouseX;
    lastY = mouseY;
    isMouseDown = true;
  }

  function handleMouseUp(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mouseup stuff here
    isMouseDown = false;
  }

  function handleMouseOut(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mouseOut stuff here
    isMouseDown = false;
  }

  function handleMouseMove(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mousemove stuff here
    if (isMouseDown) {
      ctx.beginPath();
      if (mode == "pen") {
        ctx.globalCompositeOperation = "source-over";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      } else {
        ctx.globalCompositeOperation = "destination-out";
        var size = document.getElementById("eraser_size").value;
        ctx.arc(lastX, lastY, size, 0, Math.PI * 2, false);
        ctx.fill();
      }
      lastX = mouseX;
      lastY = mouseY;
    }
  }

  $("#canvas").mousedown(function (e) {
    handleMouseDown(e);
  });
  $("#canvas").mousemove(function (e) {
    handleMouseMove(e);
  });
  $("#canvas").mouseup(function (e) {
    handleMouseUp(e);
  });
  $("#canvas").mouseout(function (e) {
    handleMouseOut(e);
  });

  var mode = "pen";
  $("#pen").click(function () {
    mode = "pen";
  });
  $("#eraser").click(function () {
    mode = "eraser";
  });

  // ------------------------------------------------------------------

  let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
  });
  let handleFail = function (err) {
    console.log("Error occured", err);
  };
  // Defines a client for Real Time Communication
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
      setupPing(canvas);
      let mediaStream = canvas.captureStream(30); // convert to mediaStream
      let videoSource = mediaStream.getVideoTracks()[0]; // get the videoSource
      let localStream = AgoraRTC.createStream({
        streamId: uid,
        video: true,
        audio: false,
        videoSource: videoSource // Pass in the video source to agora
      });
      localStream.setVideoProfile("720p_2");
      localStream.init(function () {
        client.publish(localStream); // Publish it to the channel
      });
    },
    handleFail
  );
}
function call() {
  let localmute;
  let flagone = false;
  let flagtwo = false;
  let list = [];
  let stream;
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
        localStream.play("me", { fit: "cover" });
        Client.publish(localStream);
      });
      localmute = localStream;
    },
    handleFail
  );
  Client.on("Stream Added", function (evt) {
    Client.subscribe(evt.stream, handleFail);
  });
  Client.on("Stream Subscribed", function (evt) {
    stream = evt.stream;
    list.push(stream);
    stream.play("students", { fit: "contain" });
  });
  Client.on("Stream Removed", removeVideoStream);
  Client.on("Peer Left", removeVideoStream);
  var others = document.getElementById("button");
  var me = document.getElementById("button2");
  others.addEventListener("click", function () {
    if (flagone == false) {
      list.forEach(function (Stream) {
        Stream.setAudioVolume(0);
      });
      flagone = true;
    } else {
      list.forEach(function (Stream) {
        Stream.setAudioVolume(100);
      });
      flagone = false;
    }
  });
  me.addEventListener("click", function () {
    if (flagtwo == false) {
      localmute.muteAudio();
      flagtwo = true;
    } else {
      localmute.unmuteAudio();
      flagtwo = false;
    }
  });
}
