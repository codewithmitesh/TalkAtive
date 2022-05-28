// Connecting the client side with socket.io to use socket.io in client side also ths is must need 
const socket = io()

// Holding the message input fields in variables for easy access
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
// this is a place where our template should be loaded or rendered (div with id messages)
const $messages = document.querySelector('#messages')

// all the dynamic html templates that will be rendered in messages area of html
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Using Query String to parse a Query into object username will be stored in username and room will be in room
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
/**
 * .on to receive the event send from server and run it in client side socket.io
 */
socket.on('message', (message) => {
    console.log(message)
    // Rendering the Message Templates using mustache library 
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        // Using the MomentJS library to format the date and time
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    // Inserting the particular message template at the before the end of div 
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
// to render location in a Location Template 
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// Event listener for the message form as soon as Submit button is pressed this event should executed 
$messageForm.addEventListener('submit', (e) => {
    // preventing the default behavior of client side js
    e.preventDefault()
    // Disable the button so that we can't send the message again while we are sending the message 
    $messageFormButton.setAttribute('disabled', 'disabled')
    // holding the typed msg in message variable  
    const message = e.target.elements.message.value
    /**
     * sending an event to server with data stored in message variable 
     * this event will be recieved by the server and will send the message to all active client in realtime
     * */
    socket.emit('sendMessage', message, (error) => {
        // Again enable the send button and clearing the input field of message 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        // using the focus method to move cursor in the input field again to type msg multiple times
        $messageFormInput.focus()
        // holding the error   
        if (error) {
            return console.log(error)
        }
        //Message delivered this is acknowledgement msg 
        console.log('Message delivered!')
    })
})
// To send the Current location of user Using the inbuilt Geolocation API
$sendLocationButton.addEventListener('click', () => {
    // Checking if the browser supports geolocation if not then show the alert message
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    // Disabling the location button to click again
    $sendLocationButton.setAttribute('disabled', 'disabled')
    // Getting the current location of user and sending to the server
    navigator.geolocation.getCurrentPosition((position) => {
        // sending the location to the server
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // Again enabling the location button 
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})
// To join the room we use 'join' in built method of socket.io
// sending the username and room to the server and tell them to join the if error occurs then alert error
socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})