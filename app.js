// TODO: Edit nickname option
// - Add channel option
// - Remove user from list when they logout
// - Add private messaging
// - Sort user array so current user is always on top, customize user color
// - Make general the default channel


const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const http = require("http");
const server = http.createServer(app);
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const io = new Server(server);

server.listen(port, () => console.log(`Server is running on port ${port}`));

app.use(express.static(__dirname + "/public"));

const channels = ["General", "Work", "Hobbies"];
const users = [];
const usersMap = {};



io.on('connection', (socket) => {

    socket.on('token', token => {

        const ticketHandler = (nickName) => {
            if (!nickName) {
                nickName = 'Guest' + Date.now();
            }
            let token = jwt.sign({nickName}, 'fsdkjfniw3y3424', {expiresIn: '1d'})
            const ticket = {token, nickName}
            let existCheck = users.filter(user => user == nickName)
            if (existCheck.length == 0) {
                users.push(nickName);
            }
            usersMap[nickName] = socket;
            return ticket;
        }

        if (token) {
            try {
                jwt.verify(token, "fsdkjfniw3y3424", (fail, decodedPayload) => {
                    if (fail) {
                        console.log("Token is not valid!");
                        socket.emit("ticket", ticketHandler());
                    } else {
                        currentNick = decodedPayload.nickName;
                        socket.emit('ticket', ticketHandler(decodedPayload.nickName));
                    }
                })
            } catch (err) {
                console.log(err)
            }
        } else {
            socket.emit("ticket", ticketHandler());
        }
        io.emit('users', users);
        socket.emit('channels', channels);
    })

    socket.on('send message', envelope => {
        console.log(envelope)
        if (envelope.toUser) {
            //message will go to user
            socket.emit('receive message', envelope);
            usersMap[envelope.toUser].emit('receive message', envelope);
        } else {
            // This will send the message back to all clients (that's why we use io instead of socket)
            io.emit('receive message', envelope)
        }    
    })

    socket.on('edit nickname', nickObj => {
        //Filter for oldnickname, find index, splice the array at that index and insert newNickname
        let oldNick = nickObj.oldNick;
        let index = users.indexOf(oldNick);
        nickName = nickObj.newNick
        users.splice(index, 1, nickName);
        let token = jwt.sign({nickName}, 'fsdkjfniw3y3424', {expiresIn: '1d'});
        const ticket = {token, nickName};
        socket.emit("ticket", ticket);
        io.emit('users', users);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    })
})


app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/about", (req, res) => {
    res.sendFile("about.html", {root: __dirname + "/public" });
});

