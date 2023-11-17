require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const corsOptions = {
    origin: 'http://localhost:3000', // Update this with the actual origin of your React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };
  
const app=express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())


//database
mongoose
  .connect("mongodb://127.0.0.1:27017/reminderAppDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));


//DB Schema
const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: String,
    isReminded: Boolean
})

//Create DB Model
const Reminder = new mongoose.model("reminder", reminderSchema)

//notify when reminder time hit && whatsapp msg send by twilio
setInterval(async () => {
  try {
    const reminderList = await Reminder.find({});

    if (reminderList && reminderList.length > 0) {
      for (const reminder of reminderList) {
        if (!reminder.isReminded) {
          const now = new Date();
          const timeDifference = new Date(reminder.remindAt) - now;
          if (timeDifference < 0) {

            const remindObj = await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });

            const accountSid = process.env.ACCOUNT_SID;
            const authToken = process.env.AUTH_TOKEN;
            const client = require('twilio')(accountSid, authToken);

            try {
              const message = await client.messages.create({
                body: " 🔔Hi Virendra, It's important reminder : "+reminder.reminderMsg,
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+917470952258'
              });
              console.log(`Message sent successfully with SID: ${message.sid}`);
            } catch (error) {
              console.error(`Error sending Twilio message: ${error.message}`);
            }
            
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error in the main loop: ${error.message}`);
  }
}, 1000);






    
//API routes
app.get('/getAllReminder', async (req, res) => {
    try {
      const reminderList = await Reminder.find({}).exec();
      res.send(reminderList||[]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.post('/addReminder', async (req, res) => {
    const { reminderMsg, remindAt } = req.body;
    const reminder = new Reminder({
      reminderMsg,
      remindAt,
      isReminded: false
    });

    try {
      await reminder.save();
      const reminderList = await Reminder.find({}).exec();
      res.send(reminderList||[]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.post('/deleteReminder', async (req, res) => {
    try {
      await Reminder.deleteOne({ _id: req.body.id }).exec();
      const reminderList = await Reminder.find({}).exec();
      res.send(reminderList||[]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

app.listen(9000,()=>{
    console.log(`DB is connected`);
})

