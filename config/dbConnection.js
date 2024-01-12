import mongoose from "mongoose";

const dbConnection  = () => {
    const connectionParams = {useNewUrlParser: true, useUnifiedTopology: true};

    mongoose.connect(process.env.MONGODB_URI2);

    mongoose.connection.on("connected", ()=> {
        global.log.error(`Mongodb Connected Successfully.`);
    });

    mongoose.connection.on("error", (err)=> {
        global.log.error(`Error occurs while connecting mongodb- ${JSON.stringify({err})}`);
    });

    mongoose.connection.on("disconnected", ()=> {
        global.log.error(`Mongodb connection disconnected`);
    });
}

export default dbConnection;