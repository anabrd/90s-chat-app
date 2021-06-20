const socket = io();

const state = {
    list: 'channels',
    users: [],
    channels: [],
    activeChannel: null,
    activeUser: null,
    toUser: null,
    usedChannels: [],
    usedDMs: []
}

const editNickname = () => {
    document.querySelector("#edit-nickname").style.display = "block"
    document.querySelector("#card-main").classList.remove("card-tertiary");
}

const cancelNickname = () => {
    document.querySelector("#edit-nickname").style.display = "none"
    document.querySelector("#card-main").classList.add("card-tertiary");
}

const submitNickname = () => {
    let editedNick = {oldNick: state.activeUser, newNick: document.querySelector("#new-nickname").value};
    console.log(editedNick)
    socket.emit('edit nickname', editedNick);
    cancelNickname();
}

const addChannel = () => {
    document.querySelector("#add-channel").style.display = "block"
    document.querySelector("#card-main").classList.remove("card-tertiary");
}

const cancelChannel = () => {
    console.log("clicked")
    document.querySelector("#add-channel").style.display = "none"
    document.querySelector("#card-main").classList.add("card-tertiary");
}

const submitChannel = () => {
    let newChannel = document.querySelector("#new-channel").value;
    console.log(newChannel);
    socket.emit('add channel', newChannel);
    cancelChannel();
}

const clickHandler = () => {
    let msg = document.querySelector("#msg-box");
    let envelope =  {msg: msg.value, channel: state.activeChannel, fromUser: state.activeUser, toUser: state.toUser};
    socket.emit("send message", envelope);
    console.log(envelope)
    msg.value = '';
}

const listItemSelect = (name) => {
    let preItem;
    console.log(state.list, "state.list before if/else")
    // FOR CHANNELS
    if (state.list == "channels") {
        state.toUser = null;
        console.log("state.activeChannel", state.activeChannel);
        
        if (state.activeChannel) {
            preItem = state.activeChannel;
            document.querySelector(`#${preItem}`).classList.remove('active-li');
        }
        
        state.activeChannel = name;
        document.querySelector(`#${name}`).classList.add('active-li');
        
        if (!state.usedChannels[name]) {
            state.usedChannels[name] = [];
        }
        
        document.querySelector('#chat-box').innerHTML = `<li class="text-info">Welcome to <b>#${state.activeChannel}</b> channel!`;
        state.usedChannels[state.activeChannel].forEach(msg => {
            document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li>${msg}</li>`);
        })

    // FOR DMS
    } else {
        if (state.toUser) {
            preItem = state.toUser;
            document.querySelector(`#${preItem}`).classList.remove('active-li');
        }
        
        console.log("state toUser before", state.toUser)
        state.toUser = name;
        console.log("state toUser after", state.toUser)
        document.querySelector(`#${name}`).classList.add('active-li');
        
        document.querySelector('#chat-box').innerHTML = `<li class="text-info">Here is where you can send ${state.toUser} a private message.<li>`;
        
        //state.usedDMs[state.toUser].forEach(msg => {
            //document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li><span class="text-nick">${state.toUser}:</span>${msg}</li>`);
        //})
    }
}

function listToggler(activeList) {
    document.querySelector("#user-channel-list").innerHTML = "";
    state.list = activeList;

    state[state.list].forEach(item => {
        document.querySelector("#user-channel-list").insertAdjacentHTML("beforeend", `<li id="${item}" class="li-item" onclick="listItemSelect('${item}')">${item}</li>`);
        if (item == state.activeUser) {
            document.querySelector(`#${item}`).insertAdjacentHTML("beforeend", `<span class="thats-you"> (That's you!)</span>`)
        }
    })

    if (activeList == "channels") {
        document.querySelector("#user-channel-list").insertAdjacentHTML("beforeend", `<button id="add-channel-btn" class="btn col-lg-12 btn-primary" onclick="addChannel()">Add New Channel</li>`);
        if (!state.activeChannel) {
            listItemSelect("General");
        }
    } else {
        document.querySelector("#user-channel-list").insertAdjacentHTML("beforeend", `<button id="add-channel-btn" class="btn col-lg-12 btn-primary" onclick="editNickname()">Edit Nickname</li>`);
    }


}

socket.emit('token', sessionStorage.getItem('token'));

socket.on('ticket', ticket => {
    document.querySelector("#chat-box").insertAdjacentHTML("beforeend", `<li>${ticket.nickName} has joined the chat</li>`);
    sessionStorage.setItem('token', ticket.token);
    state.activeUser = ticket.nickName;
})

socket.on('receive message', envelope => {
    if (envelope.toUser) {

        if (!state.usedDMs[envelope.toUser]) {
            state.usedDMs[envelope.toUser] = [];
        }

        Object.keys(state.usedDMs).forEach(key => {
            if (envelope.toUser == key) {
                state.usedDMs[key].push(envelope.msg);
            }
            console.log(state.usedDMs[key]);
        });

        if (state.activeUser == envelope.fromUser) {
            document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li><span class="text-nick">${envelope.fromUser}: </span>${envelope.msg}</li>`);
        }
        console.log("state", state)
    } else {
        Object.keys(state.usedChannels).forEach(key => {
            if (envelope.channel == key) {
                state.usedChannels[key].push(envelope.msg);
            }
            console.log(state.usedChannels[key]);
        })

        if (state.activeChannel == envelope.channel) {
            document.querySelector('#chat-box').insertAdjacentHTML("beforeend", `<li><span class="text-nick">${envelope.fromUser}:</span> ${envelope.msg}</li>`);
        }
    };

    
});


socket.on('users', users => {
    state.users = users;
    listToggler('users')
});

socket.on('channels', channels => {
    state.channels = channels;
    listToggler('channels')
});




