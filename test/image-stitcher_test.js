var path = require("path");
var fs = require("fs");

var expect = require("chai").expect;
var ImageStitcher = require("./../");

describe("ImageStitcher", function (done) {
  this.timeout(100000);
  var stitcher;

  beforeEach(function () {
    stitcher = new ImageStitcher();
  });

  it("does exist", function () {
    expect(typeof stitcher).to.equal("object");
  });

  it("addImage() throws error when ", function () {
    var thrown = true;

    try {
      stitcher.addImage(1);
    } catch (e) {
      thrown = true;
    }

    expect(thrown).to.equal(true);
  });

  it("addImage() adds images", function (done) {
    fs.readFile(path.join(__dirname, "fixtures", "fix-up.jpg"), function (err, data) {
      expect(!err).to.equal(true);
      stitcher.addImage("image/jpeg", data);
      expect(stitcher._images.length === 1);
      done();
    });
  });

  it("render a big image", function (done) {
    fs.readFile(path.join(__dirname, "fixtures", "fix-up.jpg"), function (err, data) {
      expect(!err).to.equal(true);
      var img1 = data;

      fs.readFile(path.join(__dirname, "fixtures", "fix-up.jpg"), function (err, data) {
        expect(!err).to.equal(true);

        var img2 = data;

        stitcher.addImage("image/jpeg", img1);
        stitcher.addImage("image/jpeg", img2);

        stitcher.render(function (err, data) {
          done();
        });
      });
    });
  });
});
