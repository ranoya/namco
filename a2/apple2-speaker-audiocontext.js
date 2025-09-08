//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function apple2_speaker_audiocontext(machine) {
  var toggles = [];
  var last_seconds;
  this.toggle = function (seconds) {
    toggles.push(seconds - (last_seconds || seconds));
    last_seconds = seconds;
  };

  if (!window.AudioContext)
    if (typeof webkitAudioContext == "function")
      AudioContext = webkitAudioContext;

  if (window.AudioContext) {
    var audio = new AudioContext();
    var buffer_size = 4096;
    var node = audio.createScriptProcessor(buffer_size, 0, 1);
    var speaker_pos = 1;
    var pulse_width = 0;
    node.onaudioprocess = function (e) {
      var data = e.outputBuffer.getChannelData(0);
      for (var s = 0, l = data.length; s < l; s++) {
        if (toggles.length) {
          // if false then we've caught up. Shouldn't happen (often)!
          if (pulse_width >= toggles[0]) {
            speaker_pos *= -1;
            toggles.shift();
            pulse_width = 0;
          }
        }
        pulse_width += 1 / e.outputBuffer.sampleRate;
        data[s] = speaker_pos;
      }
    };
    node.connect(audio.destination);
  }
}
