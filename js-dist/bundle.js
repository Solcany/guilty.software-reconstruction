(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
AFRAME.registerComponent('keyboard-event-emitter', {
    init: function () {
        const self = this.el;

        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            const key = event.key || event.keyCode;

            let event_to_emit;
            switch (key) {
            case "Down": event_to_emit = "key_down" // IE/EDGE
            case "ArrowDown": event_to_emit = "key_down"
                break;
            case "Up": event_to_emit = "key_up"
            case "ArrowUp": event_to_emit = "key_up"
                break;
            case "Left": event_to_emit = "key_left"
            case "ArrowLeft": event_to_emit = "key_left"
                break;
            case "Right": event_to_emit = "key_right"
            case "ArrowRight": event_to_emit = "key_right"
                break;
            // case "Enter":
            //     break;
            // case "Esc": // IE/Edge specific value
            // case "Escape":
            //     break;
            default:
                return; // Quit when this doesn't handle the key event.
            }
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();

            //console.log("emitting key event: " + event_to_emit);

            self.emit(event_to_emit,null,false);
        }, true);
  }
});

},{}],2:[function(require,module,exports){
const PCDLoader = require("../libs/PCDLoader.js");


AFRAME.registerComponent('pcd-model', {
    schema: {
        pcd: {type: 'asset'},
        point_size: {type: 'number', default: 1.0}
    },

    init: function () {
        this.loadPCD();
    },

    loadPCD: function () {
        let pcd = this.data.pcd
        let point_size = this.data.point_size
        let el = this.el;

        let loader = new PCDLoader();
        loader.load(pcd,
                    function (mesh) {
                        mesh.material.size = point_size
                        el.setObject3D('mesh', mesh)

                    },
	                function ( xhr ) {
		                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	                },
	                function ( error ) {
		                console.log( "Error while loading PCD: " + error );
	                }
                   )
    }
});

AFRAME.registerComponent('mouse-track', {
    init: function() {
        console.log("tracking clicks")
        this.el.addEventListener('click', function (evt) {
            console.log(evt.detail.intersection.point);
        });
    }
})

},{"../libs/PCDLoader.js":5}],3:[function(require,module,exports){
AFRAME.registerComponent('template-switcher', {
    schema: {
        templates: {type: 'array'}
    },

  // emitts: 'template_set'

  init: function () {
    this.index = 0;
    this.manage_templates();
    this.manage_audio();
  },

  set_template: function() {
    this.el.setAttribute('template', 'src', this.data.templates[this.index]);

    // wait 100 ms before emitting the 'set' event
    setTimeout(
      function() { this.el.emit('template_set', null, false) }.bind(this)
      ,100)
  },

  manage_templates: function() {
    // cycle between templates on key press
    // 
    const keyboard_emitter = document.getElementById("keyboard-emitter");
    if (!keyboard_emitter) throw new Error("keyboard emitter wasn't found in the DOM, add <a-entity id='keyboard-emitter' keyboard-event-emitter></a-entity> to DOM")

    const increase_index = function() {
      this.index += 1
      if(this.index === this.data.templates.length) this.index = 0;
      this.set_template();
    }

    const decrease_index = function() {
      if(this.index > 0) this.index -= 1;
      this.set_template();
    }

    keyboard_emitter.addEventListener('key_right', increase_index.bind(this), false);
    keyboard_emitter.addEventListener('key_left', decrease_index.bind(this), false);
  },


  manage_audio: function() {
    // play any audio present in the templates.
    // audio element <a-sound> needs to be created manually in DOM
    // fires when a new template is loaded, listens to 'template_set' event

    const sound_el = document.getElementById("audio-player");
    if (!sound_el) throw new Error("a-sound element wasn't found in the DOM, add <a-sound id='audio-player' src='' positional='false'></a-sound> to DOM")


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
        
        const sound_player = sound_el.components.sound
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

},{}],4:[function(require,module,exports){
AFRAME.registerPrimitive('a-data', {
  // Defaults the ocean to be parallel to the ground.
  defaultComponents: {
    data: {data: null,
           kind: null}
  },
  mappings: {
    data: 'data.data',
    kind: 'data.kind'
  }
});

},{}],5:[function(require,module,exports){
/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Description: A THREE loader for PCD ascii and binary files.
 */

// import {
// 	BufferGeometry,
// 	FileLoader,
// 	Float32BufferAttribute,
// 	Loader,
// 	LoaderUtils,
// 	Points,
// 	PointsMaterial
// } from "./three.module.js";



var PCDLoader = function ( manager ) {

	THREE.Loader.call( this, manager );

	this.littleEndian = true;

};


PCDLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: PCDLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( data ) {

			try {

				onLoad( scope.parse( data, url ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	},

	parse: function ( data, url ) {

		// from https://gitlab.com/taketwo/three-pcd-loader/blob/master/decompress-lzf.js

		function decompressLZF( inData, outLength ) {

			var inLength = inData.length;
			var outData = new Uint8Array( outLength );
			var inPtr = 0;
			var outPtr = 0;
			var ctrl;
			var len;
			var ref;
			do {

				ctrl = inData[ inPtr ++ ];
				if ( ctrl < ( 1 << 5 ) ) {

					ctrl ++;
					if ( outPtr + ctrl > outLength ) throw new Error( 'Output buffer is not large enough' );
					if ( inPtr + ctrl > inLength ) throw new Error( 'Invalid compressed data' );
					do {

						outData[ outPtr ++ ] = inData[ inPtr ++ ];

					} while ( -- ctrl );

				} else {

					len = ctrl >> 5;
					ref = outPtr - ( ( ctrl & 0x1f ) << 8 ) - 1;
					if ( inPtr >= inLength ) throw new Error( 'Invalid compressed data' );
					if ( len === 7 ) {

						len += inData[ inPtr ++ ];
						if ( inPtr >= inLength ) throw new Error( 'Invalid compressed data' );

					}

					ref -= inData[ inPtr ++ ];
					if ( outPtr + len + 2 > outLength ) throw new Error( 'Output buffer is not large enough' );
					if ( ref < 0 ) throw new Error( 'Invalid compressed data' );
					if ( ref >= outPtr ) throw new Error( 'Invalid compressed data' );
					do {

						outData[ outPtr ++ ] = outData[ ref ++ ];

					} while ( -- len + 2 );

				}

			} while ( inPtr < inLength );

			return outData;

		}

		function parseHeader( data ) {

			var PCDheader = {};
			var result1 = data.search( /[\r\n]DATA\s(\S*)\s/i );
			var result2 = /[\r\n]DATA\s(\S*)\s/i.exec( data.substr( result1 - 1 ) );

			PCDheader.data = result2[ 1 ];
			PCDheader.headerLen = result2[ 0 ].length + result1;
			PCDheader.str = data.substr( 0, PCDheader.headerLen );

			// remove comments

			PCDheader.str = PCDheader.str.replace( /\#.*/gi, '' );

			// parse

			PCDheader.version = /VERSION (.*)/i.exec( PCDheader.str );
			PCDheader.fields = /FIELDS (.*)/i.exec( PCDheader.str );
			PCDheader.size = /SIZE (.*)/i.exec( PCDheader.str );
			PCDheader.type = /TYPE (.*)/i.exec( PCDheader.str );
			PCDheader.count = /COUNT (.*)/i.exec( PCDheader.str );
			PCDheader.width = /WIDTH (.*)/i.exec( PCDheader.str );
			PCDheader.height = /HEIGHT (.*)/i.exec( PCDheader.str );
			PCDheader.viewpoint = /VIEWPOINT (.*)/i.exec( PCDheader.str );
			PCDheader.points = /POINTS (.*)/i.exec( PCDheader.str );

			// evaluate

			if ( PCDheader.version !== null )
				PCDheader.version = parseFloat( PCDheader.version[ 1 ] );

			if ( PCDheader.fields !== null )
				PCDheader.fields = PCDheader.fields[ 1 ].split( ' ' );

			if ( PCDheader.type !== null )
				PCDheader.type = PCDheader.type[ 1 ].split( ' ' );

			if ( PCDheader.width !== null )
				PCDheader.width = parseInt( PCDheader.width[ 1 ] );

			if ( PCDheader.height !== null )
				PCDheader.height = parseInt( PCDheader.height[ 1 ] );

			if ( PCDheader.viewpoint !== null )
				PCDheader.viewpoint = PCDheader.viewpoint[ 1 ];

			if ( PCDheader.points !== null )
				PCDheader.points = parseInt( PCDheader.points[ 1 ], 10 );

			if ( PCDheader.points === null )
				PCDheader.points = PCDheader.width * PCDheader.height;

			if ( PCDheader.size !== null ) {

				PCDheader.size = PCDheader.size[ 1 ].split( ' ' ).map( function ( x ) {

					return parseInt( x, 10 );

				} );

			}

			if ( PCDheader.count !== null ) {

				PCDheader.count = PCDheader.count[ 1 ].split( ' ' ).map( function ( x ) {

					return parseInt( x, 10 );

				} );

			} else {

				PCDheader.count = [];

				for ( var i = 0, l = PCDheader.fields.length; i < l; i ++ ) {

					PCDheader.count.push( 1 );

				}

			}

			PCDheader.offset = {};

			var sizeSum = 0;

			for ( var i = 0, l = PCDheader.fields.length; i < l; i ++ ) {

				if ( PCDheader.data === 'ascii' ) {

					PCDheader.offset[ PCDheader.fields[ i ] ] = i;

				} else {

					PCDheader.offset[ PCDheader.fields[ i ] ] = sizeSum;
					sizeSum += PCDheader.size[ i ] * PCDheader.count[ i ];

				}

			}

			// for binary only

			PCDheader.rowSize = sizeSum;

			return PCDheader;

		}

		var textData = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );

		// parse header (always ascii format)

		var PCDheader = parseHeader( textData );

		// parse data

		var position = [];
		var normal = [];
		var color = [];

		// ascii

		if ( PCDheader.data === 'ascii' ) {

			var offset = PCDheader.offset;
			var pcdData = textData.substr( PCDheader.headerLen );
			var lines = pcdData.split( '\n' );

			for ( var i = 0, l = lines.length; i < l; i ++ ) {

				if ( lines[ i ] === '' ) continue;

				var line = lines[ i ].split( ' ' );

				if ( offset.x !== undefined ) {

					position.push( parseFloat( line[ offset.x ] ) );
					position.push( parseFloat( line[ offset.y ] ) );
					position.push( parseFloat( line[ offset.z ] ) );

				}

				if ( offset.rgb !== undefined ) {

					var rgb = parseFloat( line[ offset.rgb ] );
					var r = ( rgb >> 16 ) & 0x0000ff;
					var g = ( rgb >> 8 ) & 0x0000ff;
					var b = ( rgb >> 0 ) & 0x0000ff;
					color.push( r / 255, g / 255, b / 255 );

				}

				if ( offset.normal_x !== undefined ) {

					normal.push( parseFloat( line[ offset.normal_x ] ) );
					normal.push( parseFloat( line[ offset.normal_y ] ) );
					normal.push( parseFloat( line[ offset.normal_z ] ) );

				}

			}

		}

		// binary-compressed

		// normally data in PCD files are organized as array of structures: XYZRGBXYZRGB
		// binary compressed PCD files organize their data as structure of arrays: XXYYZZRGBRGB
		// that requires a totally different parsing approach compared to non-compressed data

		if ( PCDheader.data === 'binary_compressed' ) {

			var sizes = new THREE.Uint32Array( data.slice( PCDheader.headerLen, PCDheader.headerLen + 8 ) );
			var compressedSize = sizes[ 0 ];
			var decompressedSize = sizes[ 1 ];
			var decompressed = decompressLZF( new Uint8Array( data, PCDheader.headerLen + 8, compressedSize ), decompressedSize );
			var dataview = new DataView( decompressed.buffer );

			var offset = PCDheader.offset;

			for ( var i = 0; i < PCDheader.points; i ++ ) {

				if ( offset.x !== undefined ) {

					position.push( dataview.getFloat32( ( PCDheader.points * offset.x ) + PCDheader.size[ 0 ] * i, this.littleEndian ) );
					position.push( dataview.getFloat32( ( PCDheader.points * offset.y ) + PCDheader.size[ 1 ] * i, this.littleEndian ) );
					position.push( dataview.getFloat32( ( PCDheader.points * offset.z ) + PCDheader.size[ 2 ] * i, this.littleEndian ) );

				}

				if ( offset.rgb !== undefined ) {

					color.push( dataview.getUint8( ( PCDheader.points * offset.rgb ) + PCDheader.size[ 3 ] * i + 0 ) / 255.0 );
					color.push( dataview.getUint8( ( PCDheader.points * offset.rgb ) + PCDheader.size[ 3 ] * i + 1 ) / 255.0 );
					color.push( dataview.getUint8( ( PCDheader.points * offset.rgb ) + PCDheader.size[ 3 ] * i + 2 ) / 255.0 );

				}

				if ( offset.normal_x !== undefined ) {

					normal.push( dataview.getFloat32( ( PCDheader.points * offset.normal_x ) + PCDheader.size[ 4 ] * i, this.littleEndian ) );
					normal.push( dataview.getFloat32( ( PCDheader.points * offset.normal_y ) + PCDheader.size[ 5 ] * i, this.littleEndian ) );
					normal.push( dataview.getFloat32( ( PCDheader.points * offset.normal_z ) + PCDheader.size[ 6 ] * i, this.littleEndian ) );

				}

			}

		}

		// binary

		if ( PCDheader.data === 'binary' ) {

			var dataview = new DataView( data, PCDheader.headerLen );
			var offset = PCDheader.offset;

			for ( var i = 0, row = 0; i < PCDheader.points; i ++, row += PCDheader.rowSize ) {

				if ( offset.x !== undefined ) {

					position.push( dataview.getFloat32( row + offset.x, this.littleEndian ) );
					position.push( dataview.getFloat32( row + offset.y, this.littleEndian ) );
					position.push( dataview.getFloat32( row + offset.z, this.littleEndian ) );

				}

				if ( offset.rgb !== undefined ) {

					color.push( dataview.getUint8( row + offset.rgb + 2 ) / 255.0 );
					color.push( dataview.getUint8( row + offset.rgb + 1 ) / 255.0 );
					color.push( dataview.getUint8( row + offset.rgb + 0 ) / 255.0 );

				}

				if ( offset.normal_x !== undefined ) {

					normal.push( dataview.getFloat32( row + offset.normal_x, this.littleEndian ) );
					normal.push( dataview.getFloat32( row + offset.normal_y, this.littleEndian ) );
					normal.push( dataview.getFloat32( row + offset.normal_z, this.littleEndian ) );

				}

			}

		}

		// build geometry

		var geometry = new THREE.BufferGeometry();

		if ( position.length > 0 ) geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
		if ( normal.length > 0 ) geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normal, 3 ) );
		if ( color.length > 0 ) geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( color, 3 ) );

		geometry.computeBoundingSphere();

		// build material

		var material = new THREE.PointsMaterial( { size: 1.0 } );

		if ( color.length > 0 ) {

			material.vertexColors = true;

		} else {

			material.color.setHex( 0xa8a8a8);

		}

		// build point cloud

		var mesh = new THREE.Points( geometry, material );
		var name = url.split( '' ).reverse().join( '' );
		name = /([^\/]*)/.exec( name );
		name = name[ 1 ].split( '' ).reverse().join( '' );
		mesh.name = name;

		return mesh;
	}


} )

module.exports = PCDLoader;

},{}],6:[function(require,module,exports){
!function(u){function D(n){if(t[n])return t[n].exports;var r=t[n]={exports:{},id:n,loaded:!1};return u[n].call(r.exports,r,r.exports,D),r.loaded=!0,r.exports}var t={};return D.m=u,D.c=t,D.p="",D(0)}([function(u,D,t){function n(u,D,t){return new Promise(function(n){i(D).then(function(){a[u]={template:C(D)(t.trim()),type:D},n(a[u])})})}function r(u,D,t){switch(D){case p:return u(t);case d:return u(t);case y:return Mustache.render(u,t);case h:return u.render(t);default:return c(u,t)}}function e(u,D){var t=document.querySelector(u),r=t.getAttribute("type"),e=t.innerHTML;if(!D){if(!r)throw new Error("Must provide `type` attribute for <script> templates (e.g., handlebars, jade, nunjucks, html)");if(r.indexOf("handlebars")!==-1)D=p;else if(r.indexOf("jade")!==-1)D=d;else if(r.indexOf("mustache")!==-1)D=y;else if(r.indexOf("nunjucks")!==-1)D=h;else{if(r.indexOf("html")===-1)return void l("Template type could not be inferred from the script tag. Please add a type.");D=v}}return new Promise(function(t){n(u,D,e).then(function(u){t(u,D)})})}function F(u,D){return new Promise(function(t){var r;r=new XMLHttpRequest,r.addEventListener("load",function(){n(u,D,r.response).then(function(u){t(u,D)})}),r.open("GET",u),r.send()})}function C(u){switch(u){case p:return A;case d:return E;case y:return A;case h:return o;default:return function(u){return u}}}function A(u){return Handlebars.compile(u)}function E(u){return jade.compile(u)}function o(u){return nunjucks.compile(u)}function i(u){return new Promise(function(D){if(!u||"html"===u)return D();var t=m[u];if(m[u]===!0)return D();t||(t=document.createElement("script"),m[u]=t,t.setAttribute("src",b[u]),f('Lazy-loading %s engine. Please add <script src="%s"> to your page.',u,b[u]),document.body.appendChild(t));var n=t.onload||function(){};t.onload=function(){n(),m[u]=!0,D()}})}var c=t(11),B=AFRAME.utils.debug,s=AFRAME.utils.extend,a={},l=B("template-component:error"),f=B("template-component:info"),p="handlebars",d="jade",y="mustache",h="nunjucks",v="html",m={};m[p]=!!window.Handlebars,m[d]=!!window.jade,m[y]=!!window.Mustache,m[h]=!!window.nunjucks;var b={};b[p]="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js",b[d]="https://cdnjs.cloudflare.com/ajax/libs/jade/1.11.0/jade.min.js",b[y]="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.min.js",b[h]="https://cdnjs.cloudflare.com/ajax/libs/nunjucks/2.3.0/nunjucks.min.js",AFRAME.registerComponent("template",{schema:{insert:{"default":"beforeend"},type:{"default":""},src:{"default":""},data:{"default":""}},update:function(u){var D=this.data,t=this.el,n="#"===D.src[0]?e:F,r=a[D.src];if(u&&u.src!==D.src)for(;t.firstChild;)t.removeChild(t.firstChild);return r?void this.renderTemplate(r):void n(D.src,D.type).then(this.renderTemplate.bind(this))},renderTemplate:function(u){var D=this.el,t=this.data,n={};Object.keys(D.dataset).forEach(function(u){n[u]=D.dataset[u]}),t.data&&(n=s(n,D.getAttribute(t.data)));var e=r(u.template,u.type,n);D.insertAdjacentHTML(t.insert,e),D.emit("templaterendered")}}),AFRAME.registerComponent("template-set",{schema:{on:{type:"string"},src:{type:"string"},data:{type:"string"}},init:function(){var u=this.data,D=this.el;D.addEventListener(u.on,function(){D.setAttribute("template",{src:u.src,data:u.data})})}})},function(u,D){"use strict";var t=Array.prototype.forEach,n=Object.create;u.exports=function(u){var D=n(null);return t.call(arguments,function(u){D[u]=!0}),D}},function(u,D){"use strict";u.exports=function(u){if(null==u)throw new TypeError("Cannot use null or undefined");return u}},function(u,D,t){"use strict";u.exports=t(12)()?Array.from:t(13)},function(u,D){"use strict";var t=Array.prototype.forEach,n=Object.create,r=function(u,D){var t;for(t in u)D[t]=u[t]};u.exports=function(u){var D=n(null);return t.call(arguments,function(u){null!=u&&r(Object(u),D)}),D}},function(u,D,t){"use strict";u.exports=t(28)()?Object.assign:t(29)},function(u,D){"use strict";u.exports=function(u){return"function"==typeof u}},function(u,D){"use strict";u.exports=function(u){if("function"!=typeof u)throw new TypeError(u+" is not a function");return u}},function(u,D,t){"use strict";u.exports=t(33)()?String.prototype.contains:t(34)},function(u,D,t){"use strict";var n=t(3),r=t(1);u.exports=r.apply(null,n("\n\r\u2028\u2029"))},function(u,D,t){"use strict";var n,r,e,F,C,A,E,o,i,c,B=t(36);C=function(u){return"\\"===u?A:"$"===u?E:(r+=u,C)},A=function(u){return"\\"!==u&&"$"!==u&&(r+="\\"),r+=u,C},E=function(u){return"{"===u?(e.push(r),r="",o):"$"===u?(r+="$",E):(r+="$"+u,C)},o=function(u){var D,t=c.slice(n);return B(t,"}",function(u){return B.nest>=0?B.next():void(D=u)}),null!=D?(F.push(c.slice(n,n+D)),n+=D,r="",C):(D=t.length,n+=D,r+=t,o)},i=function(u){return"\\"!==u&&"}"!==u&&(r+="\\"),r+=u,o},u.exports=function(u){var D,t,B;for(r="",e=[],F=[],c=String(u),D=c.length,t=C,n=0;n<D;++n)t=t(c[n]);return t===C?e.push(r):t===A?e.push(r+"\\"):t===E?e.push(r+"$"):t===o?e[e.length-1]+="${"+r:t===i&&(e[e.length-1]+="${"+r+"\\"),B={literals:e,substitutions:F},e=F=null,B}},function(u,D,t){"use strict";var n=t(10),r=t(42);u.exports=function(u,D){return r(n(u),D,arguments[2])}},function(u,D){"use strict";u.exports=function(){var u,D,t=Array.from;return"function"==typeof t&&(u=["raz","dwa"],D=t(u),Boolean(D&&D!==u&&"dwa"===D[1]))}},function(u,D,t){"use strict";var n=t(20).iterator,r=t(14),e=t(15),F=t(27),C=t(7),A=t(2),E=t(35),o=Array.isArray,i=Function.prototype.call,c={configurable:!0,enumerable:!0,writable:!0,value:null},B=Object.defineProperty;u.exports=function(u){var D,t,s,a,l,f,p,d,y,h,v=arguments[1],m=arguments[2];if(u=Object(A(u)),null!=v&&C(v),this&&this!==Array&&e(this))D=this;else{if(!v){if(r(u))return l=u.length,1!==l?Array.apply(null,u):(a=new Array(1),a[0]=u[0],a);if(o(u)){for(a=new Array(l=u.length),t=0;t<l;++t)a[t]=u[t];return a}}a=[]}if(!o(u))if(void 0!==(y=u[n])){for(p=C(y).call(u),D&&(a=new D),d=p.next(),t=0;!d.done;)h=v?i.call(v,m,d.value,t):d.value,D?(c.value=h,B(a,t,c)):a[t]=h,d=p.next(),++t;l=t}else if(E(u)){for(l=u.length,D&&(a=new D),t=0,s=0;t<l;++t)h=u[t],t+1<l&&(f=h.charCodeAt(0),f>=55296&&f<=56319&&(h+=u[++t])),h=v?i.call(v,m,h,s):h,D?(c.value=h,B(a,s,c)):a[s]=h,++s;l=s}if(void 0===l)for(l=F(u.length),D&&(a=new D(l)),t=0;t<l;++t)h=v?i.call(v,m,u[t],t):u[t],D?(c.value=h,B(a,t,c)):a[t]=h;return D&&(c.value=null,a.length=l),a}},function(u,D){"use strict";var t=Object.prototype.toString,n=t.call(function(){return arguments}());u.exports=function(u){return t.call(u)===n}},function(u,D,t){"use strict";var n=Object.prototype.toString,r=n.call(t(16));u.exports=function(u){return"function"==typeof u&&n.call(u)===r}},function(u,D){"use strict";u.exports=function(){}},function(u,D,t){"use strict";u.exports=t(18)()?Math.sign:t(19)},function(u,D){"use strict";u.exports=function(){var u=Math.sign;return"function"==typeof u&&(1===u(10)&&u(-20)===-1)}},function(u,D){"use strict";u.exports=function(u){return u=Number(u),isNaN(u)||0===u?u:u>0?1:-1}},function(u,D,t){"use strict";u.exports=t(21)()?Symbol:t(24)},function(u,D){"use strict";var t={object:!0,symbol:!0};u.exports=function(){var u;if("function"!=typeof Symbol)return!1;u=Symbol("test symbol");try{String(u)}catch(D){return!1}return!!t[typeof Symbol.iterator]&&(!!t[typeof Symbol.toPrimitive]&&!!t[typeof Symbol.toStringTag])}},function(u,D){"use strict";u.exports=function(u){return!!u&&("symbol"==typeof u||!!u.constructor&&("Symbol"===u.constructor.name&&"Symbol"===u[u.constructor.toStringTag]))}},function(u,D,t){"use strict";var n,r=t(5),e=t(4),F=t(6),C=t(8);n=u.exports=function(u,D){var t,n,F,A,E;return arguments.length<2||"string"!=typeof u?(A=D,D=u,u=null):A=arguments[2],null==u?(t=F=!0,n=!1):(t=C.call(u,"c"),n=C.call(u,"e"),F=C.call(u,"w")),E={value:D,configurable:t,enumerable:n,writable:F},A?r(e(A),E):E},n.gs=function(u,D,t){var n,A,E,o;return"string"!=typeof u?(E=t,t=D,D=u,u=null):E=arguments[3],null==D?D=void 0:F(D)?null==t?t=void 0:F(t)||(E=t,t=void 0):(E=D,D=t=void 0),null==u?(n=!0,A=!1):(n=C.call(u,"c"),A=C.call(u,"e")),o={get:D,set:t,configurable:n,enumerable:A},E?r(e(E),o):o}},function(u,D,t){"use strict";var n,r,e,F,C=t(23),A=t(25),E=Object.create,o=Object.defineProperties,i=Object.defineProperty,c=Object.prototype,B=E(null);if("function"==typeof Symbol){n=Symbol;try{String(n()),F=!0}catch(s){}}var a=function(){var u=E(null);return function(D){for(var t,n,r=0;u[D+(r||"")];)++r;return D+=r||"",u[D]=!0,t="@@"+D,i(c,t,C.gs(null,function(u){n||(n=!0,i(this,t,C(u)),n=!1)})),t}}();e=function(u){if(this instanceof e)throw new TypeError("TypeError: Symbol is not a constructor");return r(u)},u.exports=r=function l(u){var D;if(this instanceof l)throw new TypeError("TypeError: Symbol is not a constructor");return F?n(u):(D=E(e.prototype),u=void 0===u?"":String(u),o(D,{__description__:C("",u),__name__:C("",a(u))}))},o(r,{"for":C(function(u){return B[u]?B[u]:B[u]=r(String(u))}),keyFor:C(function(u){var D;A(u);for(D in B)if(B[D]===u)return D}),hasInstance:C("",n&&n.hasInstance||r("hasInstance")),isConcatSpreadable:C("",n&&n.isConcatSpreadable||r("isConcatSpreadable")),iterator:C("",n&&n.iterator||r("iterator")),match:C("",n&&n.match||r("match")),replace:C("",n&&n.replace||r("replace")),search:C("",n&&n.search||r("search")),species:C("",n&&n.species||r("species")),split:C("",n&&n.split||r("split")),toPrimitive:C("",n&&n.toPrimitive||r("toPrimitive")),toStringTag:C("",n&&n.toStringTag||r("toStringTag")),unscopables:C("",n&&n.unscopables||r("unscopables"))}),o(e.prototype,{constructor:C(r),toString:C("",function(){return this.__name__})}),o(r.prototype,{toString:C(function(){return"Symbol ("+A(this).__description__+")"}),valueOf:C(function(){return A(this)})}),i(r.prototype,r.toPrimitive,C("",function(){var u=A(this);return"symbol"==typeof u?u:u.toString()})),i(r.prototype,r.toStringTag,C("c","Symbol")),i(e.prototype,r.toStringTag,C("c",r.prototype[r.toStringTag])),i(e.prototype,r.toPrimitive,C("c",r.prototype[r.toPrimitive]))},function(u,D,t){"use strict";var n=t(22);u.exports=function(u){if(!n(u))throw new TypeError(u+" is not a symbol");return u}},function(u,D,t){"use strict";var n=t(17),r=Math.abs,e=Math.floor;u.exports=function(u){return isNaN(u)?0:(u=Number(u),0!==u&&isFinite(u)?n(u)*e(r(u)):u)}},function(u,D,t){"use strict";var n=t(26),r=Math.max;u.exports=function(u){return r(0,n(u))}},function(u,D){"use strict";u.exports=function(){var u,D=Object.assign;return"function"==typeof D&&(u={foo:"raz"},D(u,{bar:"dwa"},{trzy:"trzy"}),u.foo+u.bar+u.trzy==="razdwatrzy")}},function(u,D,t){"use strict";var n=t(30),r=t(2),e=Math.max;u.exports=function(u,D){var t,F,C,A=e(arguments.length,2);for(u=Object(r(u)),C=function(n){try{u[n]=D[n]}catch(r){t||(t=r)}},F=1;F<A;++F)D=arguments[F],n(D).forEach(C);if(void 0!==t)throw t;return u}},function(u,D,t){"use strict";u.exports=t(31)()?Object.keys:t(32)},function(u,D){"use strict";u.exports=function(){try{return Object.keys("primitive"),!0}catch(u){return!1}}},function(u,D){"use strict";var t=Object.keys;u.exports=function(u){return t(null==u?u:Object(u))}},function(u,D){"use strict";var t="razdwatrzy";u.exports=function(){return"function"==typeof t.contains&&(t.contains("dwa")===!0&&t.contains("foo")===!1)}},function(u,D){"use strict";var t=String.prototype.indexOf;u.exports=function(u){return t.call(this,u,arguments[1])>-1}},function(u,D){"use strict";var t=Object.prototype.toString,n=t.call("");u.exports=function(u){return"string"==typeof u||u&&"object"==typeof u&&(u instanceof String||t.call(u)===n)||!1}},function(u,D,t){"use strict";var n,r,e,F,C,A,E,o,i,c,B,s,a,l,f,p,d,y,h,v,m,b,g,x,w,j,S,O=t(3),T=t(1),k=t(2),P=t(7),_=t(40),M=t(9),$=t(39),z=Object.prototype.hasOwnProperty,N=T.apply(null,O(";{=([,<>+-*/%&|^!~?:}")),L=T.apply(null,O(";{=([,<>+-*/%&|^!~?:})]."));n=function(u){if(s&&!(B>=u))for(;B!==u;){if(!s)return;z.call($,s)?z.call(M,s)&&(l=B,++a):p=s,s=v[++B]}},r=function(u){null!=w&&y.push([j,w,u]),j={point:B+1,line:a,column:B+1-l},w=B},e=function(){var u;return j.raw=v.slice(w,B),h.push(j),y.length?(u=y.pop(),j=u[0],w=u[1],void(S=u[2])):(j=null,w=null,void(S=null))},F=function(){var u=S;return S=d,++d,n(B+1),r(u),C},A=function(){if("'"===s||'"'===s)return x=s,s=v[++B],E;if("("===s||"{"===s||"["===s)++d;else if(")"===s||"}"===s||"]"===s)S===--d&&e();else if("/"===s&&z.call(N,p))return s=v[++B],c;return s!==m||!b&&p&&!f&&!z.call(L,p)?(p=s,s=v[++B],C):g(B,p,d)},o=function(){for(;;){if(!s)return;if(z.call(M,s))return l=B+1,void++a;s=v[++B]}},i=function(){for(;;){if(!s)return;if("*"!==s)z.call(M,s)&&(l=B+1,++a),s=v[++B];else if(s=v[++B],"/"===s)return}},C=function(){var u;for(f=!1;;){if(!s)return;if(z.call($,s))f=!0,z.call(M,s)&&(l=B+1,++a);else{if("/"!==s)break;if(u=v[B+1],"/"===u)s=v[B+=2],f=!0,o();else{if("*"!==u)break;s=v[B+=2],f=!0,i()}}s=v[++B]}return A},E=function(){for(;;){if(!s)return;if(s===x)return s=v[++B],p=x,C;"\\"===s&&z.call(M,v[++B])&&(l=B+1,++a),s=v[++B]}},c=function(){for(;;){if(!s)return;if("/"===s)return p="/",s=v[++B],C;"\\"===s&&++B,s=v[++B]}},u.exports=D=function(u,t,n){var r;if(v=String(k(u)),m=String(k(t)),1!==m.length)throw new TypeError(m+" should be one character long string");for(g=P(n),b=z.call(L,m),B=0,s=v[B],a=1,l=0,f=!1,p=null,d=0,y=[],h=[],D.forceStop=!1,r=C;r;)r=r();return h},Object.defineProperties(D,{$ws:_(C),$common:_(A),collectNest:_(F),move:_(n),index:_.gs(function(){return B}),line:_.gs(function(){return a}),nest:_.gs(function(){return d}),columnIndex:_.gs(function(){return l}),next:_(function(u){if(s)return n(B+(u||1)),C()}),resume:_(function(){return A})})},function(u,D){"use strict";u.exports=RegExp.prototype.test.bind(/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|await|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)(?:[\$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D])(?:[\$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF])*$/)},function(u,D,t){"use strict";var n=t(3),r=t(1);u.exports=r.apply(null,n(" \f\t\x0B​  ​᠎ ​  ​  ​  ​  ​  ​​​  ​　"))},function(u,D,t){"use strict";var n=t(1),r=t(9),e=t(38);u.exports=n.apply(null,Object.keys(r).concat(Object.keys(e)))},function(u,D,t){"use strict";var n,r=t(5),e=t(4),F=t(6),C=t(8);n=u.exports=function(u,D){var t,n,F,A,E;return arguments.length<2||"string"!=typeof u?(A=D,D=u,u=null):A=arguments[2],null==u?(t=F=!0,n=!1):(t=C.call(u,"c"),n=C.call(u,"e"),F=C.call(u,"w")),E={value:D,configurable:t,enumerable:n,writable:F},A?r(e(A),E):E},n.gs=function(u,D,t){var n,A,E,o;return"string"!=typeof u?(E=t,t=D,D=u,u=null):E=arguments[3],null==D?D=void 0:F(D)?null==t?t=void 0:F(t)||(E=t,t=void 0):(E=D,D=t=void 0),null==u?(n=!0,A=!1):(n=C.call(u,"c"),A=C.call(u,"e")),o={get:D,set:t,configurable:n,enumerable:A},E?r(e(E),o):o}},function(u,D){"use strict";var t=Array.prototype.reduce;u.exports=function(u){var D=arguments;return t.call(u,function(u,t,n){return u+(void 0===D[n]?"":String(D[n]))+t})}},function(u,D,t){"use strict";var n=t(43),r=t(41);u.exports=function(u,D){return r.apply(null,n(u,D,arguments[2]))}},function(u,D,t){"use strict";var n=t(2),r=t(4),e=t(37),F=Array.prototype.map,C=Object.keys,A=JSON.stringify;u.exports=function(u,D){var t,E,o,i=Object(arguments[2]);return n(u)&&n(u.literals)&&n(u.substitutions),D=r(D),t=C(D).filter(e),E=t.join(", "),o=t.map(function(u){return D[u]}),[u.literals].concat(F.call(u.substitutions,function(u){var D;if(u){try{D=new Function(E,"return ("+u+")")}catch(t){throw new TypeError("Unable to compile expression:\n\targs: "+A(E)+"\n\tbody: "+A(u)+"\n\terror: "+t.stack)}try{return D.apply(null,o)}catch(t){if(i.partial)return"${"+u+"}";throw new TypeError("Unable to resolve expression:\n\targs: "+A(E)+"\n\tbody: "+A(u)+"\n\terror: "+t.stack)}}}))}}]);
},{}],7:[function(require,module,exports){
// external components
require("./libs/aframe-template-component.min.js");

// components
require("./a_components/pcd_model.js");
require("./a_components/template_switcher.js");
require("./a_components/keyboard_event_emitter.js");

// primitives
require("./a_primitives/a_data.js")

},{"./a_components/keyboard_event_emitter.js":1,"./a_components/pcd_model.js":2,"./a_components/template_switcher.js":3,"./a_primitives/a_data.js":4,"./libs/aframe-template-component.min.js":6}]},{},[7]);
