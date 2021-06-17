const socket = io();

const state = {
    list: 'channels',
    users: [],
    channels: [],
    activeChannel: 'General',
    activeUser: null,
    usedChannels: []
}

const clickHandler = () => {
    let msg = document.querySelector("#msg-box");
    console.log("ok");
    let envelope =  {msg: msg.value, channel: state.activeChannel, user: state.activeUser};
    socket.emit("chat message", envelope);
    console.log(envelope)
    msg.value = '';
}

const listItemSelect = (name) => {
    console.log(name);
    const preItem = state.activeChannel;
    state.activeChannel = name;
    document.querySelector(`#${preItem}`).classList.remove('active-li');
    document.querySelector(`#${name}`).classList.add('active-li');
    if(!state.usedChannels[name]){
            state.usedChannels[name] = [];
        }
        console.log(state.usedChannels);
        document.querySelector('#chat-box').innerHTML = `<li class="text-info">Welcome to <b>#${state.activeChannel}</b> channel!`;
        state.usedChannels[state.activeChannel].forEach( msg => {
            document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li>${msg}</li>`);
    });
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
    state.activeUser = ticket.nickName;
})

socket.on('chat msg', envelope => {
    Object.keys(state.usedChannels).forEach( key => {
        if(envelope.channel == key) {
            state.usedChannels[key].push(envelope.msg);
        }
        console.log(state.usedChannels[key]);
    });

    if (state.activeChannel == envelope.channel) {
        document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li><span class="text-nick">${envelope.user}:</span> ${envelope.msg}</li>`);
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




