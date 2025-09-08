var socket;
if (window.io) socket = io.connect("/");

function verify_trace(trace) {
  if (!socket) return;
  socket.send(trace);
}
