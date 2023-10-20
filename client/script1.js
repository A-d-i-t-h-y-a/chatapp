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
const dwnld = document.getElementById('documentdownload');

fileBtn.addEventListener('click', function(e) {
    if (e.detail === 1) {
        // fileInput.click(); // Trigger click on the file input
        // options.style.visibility = 'visible';
        // options.style.display = 'block';
        if(options.style.width == '10%'){
            options.style.width = '0%';
            options.style.height = '0%';
            setTimeout(() => {
                options.style.visibility = 'hidden'
            }, 200);
        } else{
            options.style.visibility = 'visible'
            options.style.width = '10%';
            options.style.height = '8%';
        }
    }
});

image.addEventListener('click', ()=>{
    fileInput.accept = ".jpg, .jpeg, .png, .svg"
    fileInput.click();
})

docmnt.addEventListener('click', ()=>{
    fileInput.accept = ""
    fileInput.click();
})

socket.on('rcv-msg', msg=>{
    displayMsg(msg, 'other');
})

socket.on('filercv', msg=>{
    console.log(msg);
    displayMsg(msg, 'other');
    if (msg.file) {
        createDownloadLink(msg.file);
    }
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
            const obj = (fileInput.accept=="") ? { file: { data: reader.result, name: file.name, type: file.type } } : {img: reader.result};
            displayMsg(obj, 'me');
            socket.emit("filesnd", obj);
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
    if (msg.file) {
        const fileContainer = document.createElement('div');
        const img = document.createElement('img');
        const fileName = document.createElement('p');
        const fileLink = document.createElement('a');

        fileContainer.id = 'message';
        fileName.textContent = msg.file.name;
        fileLink.textContent = msg.file.name;
        fileLink.href = msg.file.data;
        fileLink.setAttribute('download', '');
        fileLink.id = "documentdownload";
        fileLink.style.display = 'none';
        img.src = 'download.svg';


        if (str === 'me') {
            fileContainer.style.cssText = "text-align: right; background-color: white; float: right; align-self: flex-end;";
            time.style.cssText = "float: right; margin-top: 3px";
        }
        fileName.append(img);
        fileContainer.appendChild(fileName);
        // fileContainer.appendChild(br.cloneNode());
        fileContainer.appendChild(fileLink);
        fileContainer.appendChild(br);
        fileContainer.appendChild(time);

        document.getElementById('msg').appendChild(fileContainer);
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

function createDownloadLink(file) {
    const downloadLink = document.createElement('a');
    downloadLink.href = file.data;
    downloadLink.download = file.name;

    document.getElementById('msg').appendChild(downloadLink);

    downloadLink.click();

    document.getElementById('msg').removeChild(downloadLink);
}