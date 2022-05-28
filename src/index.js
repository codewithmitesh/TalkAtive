// Initializing the path package to give a access of path of public directory in which al front end will be  
const path = require('path')
// http for refactoring the express server just for sack of easiness o socket io
const http = require('http')
// Initializing the Express Server
const express = require('express')
// loading te socket io library
const socketio = require('socket.io')
// Loading the bad-words Library
const Filter = require('bad-words')
// Destructuring all methods in variable for easy access of utils file
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')
// Destructuring all methods in variable for easy access of utils file
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')
// Creating the Express App
const app = express()
// Creating the raw http server (using http method which is same as Express but express does it in background so we didn't have its access)
const server = http.createServer(app)
// initializing the socket io to our raw http server -- now our server support websocket
const io = socketio(server)
// Giving the port to server 
const port = process.env.PORT || 3000
/**
 * Declaring path of public directory using path library (TO give a access of public directory in which al front end will be stored to the express server)
 * */
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))
// io connection - This function runs each time user connect to socket(chatroom) 
io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    // extra parameter callback is for acknowledgement 
    // join is inbuilt method to join the particular room with given username 
    socket.on('join', (options, callback) => {
        // Destructuring the options object
        const {
            error,
            user
        } = addUser({
            id: socket.id,
            ...options
        })
        // if error then acknowledge the error
        if (error) {
            return callback(error)
        }
        // join the given room with given username
        socket.join(user.room)
        /**
         * - emit is used to send the message or a data from server to other clients automatically as soon as a client sends a message
         * - Basically emit sends an event
         * - socket.emit sends and manipulates just a single connection in real time but io.emit sends and manipualtes each active connections in real time
         *  */
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        /**
         *  Sending the Message that a new user has joined to all the current Active use accept the new joined user 
         *  for tha we use broadcast method of socket io 
         * broadcast method sends the message to the all active users except the user who has now joined 
         */
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        /**
         * io.to.emit -- sends(emits) the events to every client present in the specified room
         * socket.broadcast.to.emit -- sends(emits) the events to every client present in the specified room except the user who has joined or who has sent the message
         */
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        // this callback is for Acknowledgment by the server 
        callback()
    })
    /**
     * As Soon as Submit is Pressed and the message is sent this event will be executed 
     * sendMessage event is sent from client side server and we wll receive it here and by getting the message value we will send it to all active clients in real time 
     */
    socket.on('sendMessage', (message, callback) => {
        // getting all active users in room 
        const user = getUser(socket.id)
        // to stop the bad-words messages     
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        // sending the message received from a single client (through sendMessage event) to all active clients in room  
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    // sending the location received from a single client (through sendLocation event) to all active clients in room
    socket.on('sendLocation', (coords, callback) => {
        // getting ALL active users  
        const user = getUser(socket.id)
        // Sending the location to all clients and generating the google maps link 
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        // callback for acknowledgement 
        callback()
    })
    // this 'connection' and 'disconnect' event are Inbuilt in socket.io  and we can use them to handle the connection and disconnection of users
    // below event occurs when a user in room disconnects (means leave the room or close the browser window) 
    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
// Listing the Server or Starting the Server
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
/**
 * Note :- To Start a Dev script or to run the server in the local machine use the below command
 * npm run start
 * or
 * npm run dev
 */


/**
 * to check weather we send a message or location is recieved by server we use acknowledgement 
 * server(emit) --> client(receive) --> Acknowledgement --> server
 * 
 * when client sends a message we can show a message sent successfully or sent tik mark just like that...
 * client(emit) -> server(receive) --> Acknowledgement --> client
 * 
 * this acknowledgement is a use-case of validation we can validate a messages send like , avoid the bad language and bad   words 
 */