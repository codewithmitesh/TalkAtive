// * Creating a Function which returns an Object with respected Fields
const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}
// Exports  
module.exports = {
    generateMessage,
    generateLocationMessage
}