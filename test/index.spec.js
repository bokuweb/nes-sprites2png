const assert = require("assert");
const fs = require("fs");
const exec = require('child_process').exec;

describe('nes-sprites2png spec', () => {
  it ('should create png from sample.nes', (done) => {
    exec('node ./index.js "./test/sample.nes"', (err, stdout, stderr) => {
      if (err) {
        assert.fail();
      }
      try {
        const png = fs.readFileSync("./sprite.png");
      } catch (e) {
        asser.fail();
      }
      done();
    });
  })
})
