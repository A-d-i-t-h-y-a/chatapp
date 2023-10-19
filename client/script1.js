// import io from './node_modules/socket.io-client/dist/socket.io.js'
const socket = io("http://192.168.29.39:5000")

const roomjoin = document.getElementById('joinbtn')
const sendjoin = document.getElementById('sendbtn')
const msginp = document.getElementById('send')
const roomname = document.getElementById('join')
const form = document.getElementById('form')
const messagecont = document.getElementById('msg')
const fileInput = document.getElementById('fileInput');
const fileBtn = document.getElementById('filebtn');

fileBtn.addEventListener('click', function(e) {
    if (e.detail === 1) {
        fileInput.click(); // Trigger click on the file input
    }
});

socket.on('rcv-msg', msg=>{
    displayMsg(msg, 'other');
})

socket.on('filercv', msg=>{
    displayMsg(msg, 'other');
})

form.addEventListener('submit', e=>{
    e.preventDefault();
    const msg = msginp.value;
    const room = roomname.value;
    const reader = new FileReader();
    const file = fileInput.files[0];
    if(!file && msg==="") return;
    if(file){
        reader.readAsDataURL(file);
        reader.onload = ()=>{
            const imageobj = {img: reader.result};
            displayMsg(imageobj, 'me');
            socket.emit("filesnd", imageobj);
        }
        fileInput.value = "";
    }
    if(msg === "") return;
    displayMsg(msg, 'me');
    socket.emit('snd-message', msg, room);
    msginp.value = "";
})

roomjoin.addEventListener('click', ()=>{
    const room = roomname.value;
    socket.emit('join-room', room);
})


function displayMsg(msg, str){
    const time = document.createElement('span');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const meridian = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    time.textContent = `${formattedHours}:${minutes} ${meridian}`;
    const br = document.createElement('br');
    if(msg.img){
        const img = document.createElement('img');
        img.src = msg.img;
        img.id = "sndimg";
        if(str == 'me'){
            img.style.cssText = "text-align: right; background-color: white; float: right; align-self: flex-end;";
            time.style.cssText = "float: right; margin-top: 3px"
        }
        img.append(br);
        img.append(time);
        document.getElementById('msg').append(img);
        messagecont.scrollTop = messagecont.scrollHeight;
        return;
    }
    const message = document.createElement('p');
    message.id = "message";
    message.textContent = msg;
    if(str == 'me'){
        message.style.cssText = "text-align: right; background-color: white; float: right; align-self: flex-end;";
        time.style.cssText = "float: right; margin-top: 3px"
    }
    message.append(br);
    message.append(time);
    document.getElementById('msg').append(message);
    messagecont.scrollTop = messagecont.scrollHeight;
}