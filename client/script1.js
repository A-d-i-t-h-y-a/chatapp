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
const options = document.getElementById('options');
const image = document.getElementById('image')
const docmnt = document.getElementById('document')

document.addEventListener('DOMContentLoaded', ()=>{
    sessionStorage.setItem('name', 'guest');
    const a = prompt("Enter your Name");
    if(a!= null)
    sessionStorage.setItem('name', a);
    let name = sessionStorage.getItem('name');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementsByTagName('h2')[0].innerHTML = name;
    socket.emit('newuser', name);
})

let flag = true;

msginp.addEventListener('input', ()=>{
    const name = sessionStorage.getItem('name');
    if(!flag && msginp.value === ''){
        socket.emit('notype', name);
        flag = true;
    }
    else if(flag){
        socket.emit('typing', name);
        flag = false;
    }
})

socket.on('notyping', name=>{
    document.getElementsByClassName('typingmsg')[0].remove();
})

socket.on('typeanim', (name)=>{
    const message = document.createElement('div');
    const div = document.createElement('div');
    const username = document.createElement('p');
    username.textContent = name;
    username.id = 'uname'
    message.id = 'message';
    div.classList.add('bouncing-loader');
    div.innerHTML = `<div></div>
    <div></div>
    <div></div>`;
    message.classList.add('typingmsg');
    message.append(username);
    message.append(div);
    document.getElementById('msg').append(message);
    messagecont.scrollTop = messagecont.scrollHeight
})


socket.on('joined', name=>{
    const user = document.createElement('p');
    user.textContent = name+' joined chat';
    user.style.cssText = 'border-radius: 10px;padding: 0.8% 0;margin-bottom:0.4% ;background-color: yellow;text-align: center;'
    document.getElementById('msg').append(user);
});

function toggleoptions(){
    if(options.style.width == '10%'){
        options.style.padding = '0 0'
        options.style.height = '0%';
        setTimeout(() => {
            options.style.width = '0%';
            options.style.visibility = 'hidden'
        },175);
    } else{
        options.style.visibility = 'visible'
        setTimeout(() => {
            options.style.padding = '1.1rem 0'
        },50);
        options.style.width = '10%';
        options.style.height = '5%';
    }
}

fileBtn.addEventListener('click', function(e) {
    if (e.detail === 1) {
        toggleoptions();
    }
});

image.addEventListener('click', ()=>{
    fileInput.accept = ".jpg, .jpeg, .png, .svg"
    fileInput.click();
    toggleoptions();
})

docmnt.addEventListener('click', ()=>{
    fileInput.accept = ""
    fileInput.click();
    toggleoptions();
})


socket.on('rcv-msg', (msg, uname)=>{
    displayMsg(msg, 'other', uname);
})

socket.on('filercv', (msg, uname)=>{
    displayMsg(msg, 'other', uname);
})

form.addEventListener('submit', e=>{
    e.preventDefault();
    const msg = msginp.value;
    const room = roomname.value;
    const reader = new FileReader();
    const file = fileInput.files[0];
    const uname = sessionStorage.getItem('name');
    if(!file && msg==="") return;
    if(file){
        reader.readAsDataURL(file);
        reader.onload = ()=>{
            const obj = (fileInput.accept=="") ? { file: { data: reader.result, name: file.name, type: file.type } } : {img: reader.result};
            displayMsg(obj, 'me', uname);
            socket.emit("filesnd", obj, uname);
        }
        fileInput.value = "";
    }
    if(msg === "") return;
    if(!flag) flag = true;
    displayMsg(msg, 'me', uname);
    socket.emit('snd-message', msg, room, uname);
    msginp.value = "";
})

roomjoin.addEventListener('click', ()=>{
    const room = roomname.value;
    socket.emit('join-room', room);
})


function displayMsg(msg, str, uname){
    if(document.getElementsByClassName('typingmsg')[0]!=undefined){
        document.getElementsByClassName('typingmsg')[0].remove();
        flag = true;
    }
    const username = document.createElement('p');
    username.textContent = uname;
    username.id = 'uname'
    const time = document.createElement('span');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const meridian = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    time.textContent = `${formattedHours}:${minutes} ${meridian}`;
    const br = document.createElement('br');
    if(msg.img){
        const div = document.createElement('div');
        const img = document.createElement('img');
        div.id = 'message';
        img.src = msg.img;
        img.id = "sndimg";
        if(str == 'me'){
            div.style.cssText = "text-align: right; background-color: white; float: right; align-self: flex-end;";
            time.style.cssText = "float: right; margin-top: 3px"
        }
        div.append(username);
        div.append(img);
        div.append(br);
        div.append(time);
        document.getElementById('msg').append(div);
        messagecont.scrollTop = messagecont.scrollHeight;
        return;
    }
    if (msg.file) {
        const fileContainer = document.createElement('div');
        const img = document.createElement('img');
        const fileName = document.createElement('p');
        const fileLink = document.createElement('a');

        fileContainer.id = 'message';
        fileName.textContent = msg.file.name;
        fileLink.textContent = msg.file.name;
        fileLink.href = msg.file.data;
        // fileLink.setAttribute('download', '');
        fileLink.download = msg.file.name;
        fileLink.id = "docdwnld"+msg.file.name;
        fileLink.style.display = 'none';
        // fileLink.style.display = 'none';
        img.src = 'download.svg';
        img.id = msg.file.name;
        img.classList.add('downloadbtn')

        if (str === 'me') {
            fileContainer.style.cssText = "text-align: right; background-color: white; float: right; align-self: flex-end;";
            time.style.cssText = "float: right; margin-top: 3px";
        }
        
        fileName.append(img);
        fileContainer.append(username)
        fileContainer.appendChild(fileName);
        // fileContainer.appendChild(br.cloneNode());
        fileContainer.appendChild(fileLink);
        fileContainer.appendChild(br);
        fileContainer.appendChild(time);
        document.getElementById('msg').appendChild(fileContainer);
        messagecont.scrollTop = messagecont.scrollHeight;
        img.addEventListener('click', ()=>{
            fileLink.click();
        })
        return;
    }
    const message = document.createElement('p');
    message.id = "message";
    if(str == 'me'){
        message.style.cssText = "text-align: right; background-color: white; float: right; align-self: flex-end;";
        time.style.cssText = "float: right; margin-top: 3px"
        username.style.color = 'red';
    }
    message.innerHTML = `${username.outerHTML} ${msg}`;
    message.append(br);
    message.append(time);
    document.getElementById('msg').append(message);
    messagecont.scrollTop = messagecont.scrollHeight;
}

function createDownloadLink(file) {
    const downloadLink = document.createElement('a');
    downloadLink.href = file.data;
    downloadLink.download = file.name;

    document.getElementById('msg').appendChild(downloadLink);

    downloadLink.click();

    document.getElementById('msg').removeChild(downloadLink);
}