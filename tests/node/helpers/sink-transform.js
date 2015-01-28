var stream = require('stream');

var sinkTransform = module.exports = function (input) {
  var inputSink = sinkTransform.input;

  input
      .on('end', function () {
        inputSink.end();
      })
      .on('data', function (item) {
        inputSink.write(item);
      });
};

sinkTransform.reset = function () {
  if (sinkTransform.input) {
    sinkTransform.input.end();
  }

  sinkTransform.input = new stream.PassThrough({ objectMode: true });
};
