require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SocketServer = require('./socketServer');

const corsOptions = {
  Credentials: 'true',  // Fix: It's 'credentials' not 'Credential' (case-sensitive)
};

const app = express();

app.use(express.json());
app.options("*", cors(corsOptions));  // Allow all routes to handle pre-flight requests
app.use(cors(corsOptions));  // Enable CORS for all routes
app.use(cookieParser());  // Parse cookies

//#region // !Socket
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', socket => {
    SocketServer(socket);  // Your socket connection handling function
});
//#endregion

//#region // !Routes
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/adminRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));
//#endregion

// Get the MongoDB URI from environment variable
const URI = process.env.MONGODB_URI;

// Check if the MongoDB URI is set properly
if (!URI) {
  console.error('MongoDB URI is not set in the environment variables.');
  process.exit(1);  // Stop the application if URI is not set
}

// Connect to MongoDB
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) throw err;
    console.log("Database Connected!!");
});

// Get port from environment variable or use default (8080)
const port = process.env.PORT || 8080;

// Start the server
http.listen(port, () => {
  console.log("Listening on port", port);
});
