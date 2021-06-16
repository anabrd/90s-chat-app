const socket = io();

const state = {
    list: 'channels',
    users: [],
    channels: [],
    activeChannel: 'General',
    activeUser: null
}

const clickHandler = () => {
    let msg = document.querySelector("#msg-box");
    console.log("ok")
    socket.emit("chat message", {msg: msg.value, channel: state.activeChannel, user: state.activeUser});
    msg.value = '';
}

const listItemSelect = (name) => {
    const preItem = state.activeChannel;
    state.activeChannel = name;
    document.querySelector(`#${preItem}`).classList.remove('active-li');
    document.querySelector(`#${name}`).classList.add('active-li');
}

function listToggler(activeList) {
    document.querySelector("#user-channel-list").innerHTML = "";
    state.list = activeList;
    state[state.list].forEach(item => {
        document.querySelector("#user-channel-list").insertAdjacentHTML("beforeend", `<li id="${item}" class="li-item" onclick="listItemSelect('${item}')">${item}</li>`);
    })
}

socket.emit('token', sessionStorage.getItem('token'));

socket.on('ticket', ticket => {
    document.querySelector("#chat-box").insertAdjacentHTML("beforeend", `<li>${ticket.nickName} has joined the chat</li>`);
    sessionStorage.setItem('token', ticket.token);

    
})

socket.on('chat msg', envelope => {
    console.log(document.querySelector("#chat-box"))
    if (state.activeChannel == envelope.channel) {
        document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li>${envelope.msg}</li>`);
    }
});


socket.on('users', users => {
    state.users = users;
    listToggler('users')
});

socket.on('channels', channels => {
    state.channels = channels;
    listToggler('channels')
});




