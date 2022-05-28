// Storing the all present usera using the app into the array 
const users = []
/**
 *  Function to add the user with id username and room parameters
 * 
 * */
const addUser = ({
    id,
    username,
    room
}) => {
    // Cleaning the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    // Validate the data both username and room are always required 
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
    // Checking for existing user if already exists then return the error
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // if already exists then return the error 
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {
        id,
        username,
        room
    }
    // push the user in array
    users.push(user)
    // user is added now return the user
    return {
        user
    }
}
// function to remove user asap it disconnects or close the Browser
// to remove first we need to find that use by id 
const removeUser = (id) => {
    // first find the position of user by using the findIndex property of array
    const index = users.findIndex((user) => user.id === id)
    // if user found then remove it from array using splice method
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
// to get a user by ID
const getUser = (id) => {
    return users.find((user) => user.id === id)
}
// to get all the users present in the room 
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}