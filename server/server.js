const { LogError } = require('concurrently')

const io = require('socket.io')(5000, {
    cors: {
        origin: ["http://192.168.29.39:3000", "http://localhost:3000"]
    },
    maxHttpBufferSize: 5e7
})

io.on('connection', socket=>{
    console.log(socket.id);
    socket.on('newuser', name=>{
        socket.broadcast.emit('joined', name);
    })

    socket.on('typing', (name)=>{
        socket.broadcast.emit('typeanim', name);
    })

    socket.on('notype', (name)=>{
        socket.broadcast.emit('notyping', name);
    })

    socket.on('snd-message', (msg, room, uname)=>{
        if(room === ""){
            socket.broadcast.emit('rcv-msg', msg, uname);
        }
        else{
            socket.to(room).emit('rcvmsg', msg);
        }
    })

    socket.on('filesnd', (msg, uname)=>{
        socket.broadcast.emit('filercv', msg, uname);
    })

    socket.on('join-room', room=>{
        socket.join(room)
    })
})