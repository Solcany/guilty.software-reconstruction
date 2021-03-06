const {loadJSON} = require('../js_components/utils.js')

const register_template_switcher = function() {
  AFRAME.registerComponent('template-switcher', {
    schema: {
      parseAudio: {type: 'boolean', default: false},
      fromJson: {type: 'string'}
    },

    // emitts: 'template_set'
    init: function () {
      this.index = 0;
      this.manage_templates_();

      if(this.data.parseAudio) {
        this.manage_audio();
      }
    },

    set_template: function(path) {
      this.el.setAttribute('template', 'src', path);
      // wait 100 ms before emitting the 'set' event
      setTimeout(
        function() { this.el.emit('template_set', null, false) }.bind(this)
        ,100)
    },

    manage_templates: function() {
      // cycle between templates on key press

      const keyboard_emitter = document.getElementById("keyboard-emitter");
      if (!keyboard_emitter) throw new Error("keyboard emitter wasn't found in the DOM, add <a-entity id='keyboard-emitter' keyboard-event-emitter></a-entity> to DOM")

      var paths = [];

      if(this.data.fromJson) {
        loadJSON(this.data.fromJson, function(response) {
          templates = JSON.parse(response);
          for (let i = 0; i < templates.length; i++) {
            let template = templates[i]
            let path = template["template_path"]
            paths.push(path)
          }
        })
      } else {
        throw new Error("no templates paths provided for this template switcher")
      }

      const increase_index = function() {
        this.index += 1
        if(this.index === this.data.templates.length) this.index = 0;
        let path = paths[this.index]
        this.set_template(path);
      }
      const decrease_index = function() {
        if(this.index > 0) this.index -= 1;
        let path = paths[this.index]
        this.set_template(path);
      }
      keyboard_emitter.addEventListener('key_right', increase_index.bind(this), false);
      keyboard_emitter.addEventListener('key_left', decrease_index.bind(this), false);
    },

    manage_templates_: function() {
      // cycle between templates on key press

      // from timeline
      const timeline = document.getElementById("timeline");
      if(!timeline) throw new Error("div#timeline is missing from DOM, create one manually at the top of the document")

      const process_event = function(self, event) {
        let data = event.detail.data
        let path = data["template_path"]
        this.set_template(path);
      }

      timeline.addEventListener("timeline_change",
                                process_event.bind(this, event))
      // let templates;

      // if(this.data.fromJson) {
      //   loadJSON(this.data.fromJson, function(response) {
      //     templates = JSON.parse(response);
      //     for (let i = 0; i < templates.length; i++) {
      //       let template = templates[i]
      //       let path = template["template_path"]
      //       paths.push(path)
      //     }
      //   });
      // } else {
      //   throw new Error("no templates paths provided for this template switcher")
      // }

        },

    manage_audio: function() {
      // play any audio present in the templates.
      // audio element <a-sound> needs to be created manually in DOM
      // fires when a new template is loaded, listens to 'template_set' event

      const sound_el = document.getElementById("audio-player");
      if (!sound_el) throw new Error("a-sound element wasn't found in the DOM, add <a-sound id='audio-player' src='' positional='false'></a-sound> to DOM")

      const sound_player = sound_el.components.sound
      sound_player.stopSound();

      const play_audio = function() {
        // get the html content of the currently loaded aframe template
        const template_html = this.el.components.template.el

        // get all a-data elements from the current aframe template
        const data_html = template_html.getElementsByTagName("a-data");
        const data = Array.from(data_html);

        // get audio datai
        const audio = data.filter(datum => datum.getAttribute('kind') === 'audio')// === 'audio')
        if(audio.length === 0) console.warn("this template has no audio attached")

        //play attached audio (if there's any in the template)
        if(audio.length > 0) {
          // WIP: currently plays only the first audio source in the template
          const src = audio[0].getAttribute('data')
          sound_el.setAttribute('sound','src', src);
          sound_player.playSound();

        } else {
          return;
        }
      }

      this.el.addEventListener('template_set', play_audio.bind(this), false);
    }


    // tick: function (time) {
    //   // Swap every second.
    //   var self = this;
    //   if (time - this.time < 2000) { return; }
    //   this.time = time;

    //   // Set template.
    //   this.maskEl.emit('fade');
    //   setTimeout(function () {
    //     self.el.setAttribute('template', 'src', self.data[self.index++]);
    //     self.maskEl.emit('fade');
    //     if (self.index === self.data.length) { self.index = 0; }
    //   }, 200);
    // }
  });
}
exports.register_template_switcher = register_template_switcher
