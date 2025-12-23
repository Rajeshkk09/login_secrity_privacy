const mongoose  =  require("mongoose");

const connection  =  () =>{
    const URL = process.env.MONGO_URL;
    mongoose.connect(URL,
        {
            dbName:"MERN_AUTHENTICATION"
        }
    ).then(()=>{
        console.log("Connected to database.");
    }).catch((err)=>{
        console.log(`database not connected this ERROR:=>${err}`);
        
    })
}

module.exports = connection;
