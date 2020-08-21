const loadJSON = function(path, callback) {

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', path, false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null); 
}

const cleanDOMId = function(id) {
      if (id.includes('#')) {
          return id.replace('#', '');
      } else {
          return id;
      }
}

const addHashToString = function(string) {
      if (string.includes('#')) {
          return string
      } else {
          return '#' + string;
      }
}

exports.loadJSON = loadJSON
exports.cleanDOMId = cleanDOMId
exports.addHashToString = addHashToString
