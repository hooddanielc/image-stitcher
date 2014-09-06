var http = require("http");
var path = require("path");
var fs = require("fs");
var util = require("util");
var EventEmitter = require('events').EventEmitter;

var phantom = require("phantom");
var express = require("express");

var ImageStitcher = function () {
  var self = this;
  this._images = [];

  var app = express();

  var server = http.createServer(app).listen(function () {
    console.log(server.address().port);
    app.set("port", server.address().port);
    console.log("Port is " + server.address().port);
  });

  app.get("/", function(req, res) {
    fs.readFile(path.join(__dirname, "static", "phantom-stitcher.html"), function (err, data) {
      res.set("Content-Type", "text/html");
      res.send(data);
    });
  });

  app.get("/get-image-count", function (req, res) {
    res.send(self._images.length + "");
  });

  app.get("/get-image/:image", function (req, res) {
    console.log("gettin an image");
    var img = self._images[parseInt(req.params.image)];
    res.set("Content-Type", img.contentType);
    res.send(img.data);
  });

  app.get("/log/:msg", function (req, res) {
    console.log(req.params.msg);
    res.send("");
  });

  this.app = app;
};

util.inherits(ImageStitcher, EventEmitter);

/*
 * Adds an image to be stitched from top to bottom
 * This function trusts that you know the content type
 *
 * @param data - instance of Buffer object
 * @param callback - callback function err, data
 */
ImageStitcher.prototype.addImage = function (contentType, data) {
  if (!data instanceof Buffer) {
    throw {
      error: "addImage(buf) expects first parameter to be an instance of Buffer"
    }
  }

  this._images.push({
    contentType: contentType,
    data: data
  });
};

/*
 * renders images together from top to bottom
 *
 * @param callback - 
 */
ImageStitcher.prototype.render = function (cb) {
  var self = this;

  phantom.create(function (ph) {
    ph.createPage(function (page) {
      page.open("http://127.0.0.1:" + self.app.get("port") + "/", function (status) {
        page.evaluate(function () {

          // get all files
          var req = new XMLHttpRequest();

          req.onload = function () {
            loadImages(parseInt(req.responseText));
          };

          req.open("get", "/get-image-count", true);
          req.send();
          return document.title;
        }, function (result) {
          ph.exit();
        });
      });
    });
  });
};

module.exports = ImageStitcher;
