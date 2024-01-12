import mongoose from "mongoose";

const dbConnection  = () => {
    const connectionParams = {useNewUrlParser: true, useUnifiedTopology: true};

    mongoose.connect(process.env.MONGODB_URI, connectionParams);

    mongoose.connection.on("connected", ()=> {
        console.log("Mongodb Connected Successfully");
    });

    mongoose.connection.on("error", (err)=> {
        console.log("Error occurs while connecting mongodb- "+ err);
    });

    mongoose.connection.on("disconnected", ()=> {
        console.log("Mongodb connection disconnected");
    });
}

export default dbConnection;