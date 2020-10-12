var io = require('socket.io')(3333);

console.log('Server has started');

io.sockets.on('connection', function (socket) {
  console.log('socket connected: ' + socket.id);

  socket.emit('serverMsg', {
    msg: 'hello from server',
  });

  socket.on('disconnect', function () {
    console.log('socket disconnected');
  });
});
