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

io.on('connection', (socket) => {
    
    socket.emit('channels', channels);

    socket.on('token', token => {

        const ticketHandler = (nickName) => {
            if (!nickName) {
                nickName = 'Guest' + Date.now();
            }
            let token = jwt.sign({nickName}, 'fsdkjfniw3y3424', {expiresIn: '1d'})
            const ticket = {token, nickName}
            users.push(nickName)
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
    })

    socket.on('chat message', envelope => {
        if (envelope.user) {
            // message will go to user
        } else {
            // This will send the message back to all clients (that's why we use io instead of socket)
            io.emit('chat msg', envelope)
        }
        
    })

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

