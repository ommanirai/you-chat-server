const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./configs/db");
const apiRoutes = require("./api.routes");
const { Server } = require("socket.io");
const http = require("http");
const Conversation = require("./models/conversations.model");
const UserModel = require("./models/user.model");
const server = http.createServer(app);

const PORT = process.env.PORT;

app.use(morgan("dev"));
app.use(cors());

app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

let users = [];
io.on("connection", socket => {
    console.log("Connected... id:", socket.id)
    socket.on("active_user", userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            // console.log("users: ", users)
            io.emit("get_users", users);
        }
    })

    socket.on("send_message", async ({ conversation_id, sender_id, message }) => {
        try {
            // get sender info
            const sender = await UserModel.findById(sender_id).select("email full_name");

            const payload = {
                user: {
                    _id: sender._id,
                    email: sender.email,
                    full_name: sender.full_name,
                },
                message,
                conversation_id,
            }

            const conversation = await Conversation.findById(conversation_id);

            if (!conversation) return;

            const receiverId = conversation.members.find(member => member.toString() !== sender_id);

            const receiver = users.find(user => user.userId === receiverId.toString());

            if (receiver) {
                io.to(receiver.socketId).emit("receive_message", payload)
            }
            // OPTIONAL: emit back to sender for realtime sync, if no local update in client
            // io.to(socket.id).emit("receive_message", payload)
        }
        catch (err) {
            console.log(err)
        }
    })

    socket.on("disconnect", () => {
        console.log('Disconnected... id:', socket.id);
        users = users.filter(u => u.socketId !== socket.id);
        io.emit("get_users", users)
    })
})

// app.use("/", apiRoutes)
app.use("/", (req,res,next) =>{
    res.json({
        msg:"Vercel Backend Running!",
        status:200
    })
})

app.use(function (req, res, next) {
    next({
        msg: "Not Found",
        status: 404,
    })
})

app.use(function (err, req, res, next) {
    res.status(err.status || 400)
    res.json({
        msg: err.msg || err,
        status: err.status || 400
    })
})

server.listen(PORT, (err, done) => {
    if (err) {
        console.log("error is: ", err);
    }
    else {
        console.log("server listening at port: ", PORT);
    }
})