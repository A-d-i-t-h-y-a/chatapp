const io = require('socket.io')(5000, {
    cors: {
        origin: ["http://192.168.29.39:3000", "http://localhost:3000"]
    },
    maxHttpBufferSize: 5e7
})

io.on('connection', socket=>{
    console.log(socket.id);
    socket.on('snd-message', (msg, room)=>{
        if(room === ""){
            socket.broadcast.emit('rcv-msg', msg);
        }
        else{
            socket.to(room).emit('rcvmsg', msg);
        }
    })

    socket.on('filesnd', msg=>{
        socket.broadcast.emit('filercv', msg);
    })

    socket.on('join-room', room=>{
        socket.join(room)
    })
})