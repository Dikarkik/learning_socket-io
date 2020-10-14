var io = require('socket.io')(3333);

console.log('Server listening on port 3333...');

let ROOM_LIST = {}; // key: <id1>-AND-<id2>, value: <Room object>
let room = null; // will be <Room object>

io.on('connection', function (socket) {
  console.log('socket connected: ' + socket.id);

  if (!room) { // player 1
    console.log('JOIN. player 1 ---> ' + socket.id);
    // Prepares the new 'Room'
    room = Room(socket);
  } else if (room) { // player 2
    console.log('JOIN. player 2 ---> ' + socket.id);
    // complete the 'Room'
    let roomID = `${room.player1_socket.id}-AND-${socket.id}`;
    room.id = roomID;
    room.player2_socket = socket;

    // save room in ROOM_LIST
    ROOM_LIST[roomID] = room;

    // frees 'room'
    room = null;

    // Creates socket.io room """"
    ROOM_LIST[roomID].player1_socket.join(ROOM_LIST[roomID].player2_socket.id);
    ROOM_LIST[roomID].player2_socket.join(ROOM_LIST[roomID].player1_socket.id);

    console.log('current ROOM_LIST: ');
    for (var key in ROOM_LIST) {
      console.log('ROOM_LIST[' + key + '] ==> ' + ROOM_LIST[key]);
    }

    // prepare data to send
    let data = { ...ROOM_LIST[roomID] };
    delete data.player1_socket;
    delete data.player2_socket;
    data['player1_id'] = ROOM_LIST[roomID].player1_socket.id;
    data['player2_id'] = ROOM_LIST[roomID].player2_socket.id;
    io.to(ROOM_LIST[roomID].player1_socket.id).emit('start game', data);
    io.to(ROOM_LIST[roomID].player2_socket.id).emit('start game', data);
  }

  socket.on('disconnecting', (reason) => {
    // In case this player is on current matchmaking
    if (room && room.player1_socket.id === socket.id)
      room = null;
    // Finish his game and notify other player
    let rooms = Object.keys(socket.rooms);
    console.log(socket.rooms);
    // disconnect the other player
    // ...
  });

  socket.on('disconnect', function () {
    console.log('socket disconnected');
  });
});

var Room = function (player1_socket) {
  var self = {
    id: null,
    player1_socket: player1_socket,
    player2_socket: null,
    board: null,
  }
  return self;
};
