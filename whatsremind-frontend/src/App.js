import './App.css';
import React,{useState,useEffect} from 'react';
import DatePicker from 'react-datepicker';
import DateTimePicker from 'react-datetime-picker';
import 'react-datepicker/dist/react-datepicker.css'; 
import axios from 'axios';

function App() {
  const [reminderMsg, setReminderMsg] = useState('');
  const [remindAt, setRemindAt] = useState(new Date()); 
  const [reminderList, setReminderList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9000/getAllReminder').then((res) => setReminderList(res.data));
  }, []);
  
  const addReminder = () => {
    axios.post('http://localhost:9000/addReminder', { reminderMsg, remindAt })
      .then((res) => setReminderList(res.data))
      .catch((error) => console.error('Error adding reminder:', error));
      setReminderMsg("")
      setRemindAt(new Date());
  };
  
  const deleteReminder = (id) => {
    axios.post('http://localhost:9000/deleteReminder', { id })
      .then((res) => setReminderList(res.data))
      .catch((error) => console.error('Error deleting reminder:', error));
  };

  return (
    <div className="App">
      <div className="homepage">
        <div className="homepage_header">
          <h1>Notify Me 🙋</h1>
          <input
            type="text"
            placeholder="Reminder notes here..."
            value={reminderMsg}
            onChange={(e) => setReminderMsg(e.target.value)}
          />
          <DatePicker className='datePicker' 
            selected={remindAt}
            onChange={(date) => setRemindAt(date)}
            minDate={new Date()}
            showTimeSelect
            dateFormat="Pp" 
          />
          <div className="button" onClick={addReminder}>
            Add Reminder
          </div>
        </div>

        <div className="homepage_body">
        {reminderList.map((reminder) => (
          <div className="reminder_card" key={reminder._id}>
             <h3>{reminder.reminderMsg}</h3>
             <h4>Remind Me at:</h4>
              {reminder.remindAt ? (
                <p>{new Date(reminder.remindAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
                  ) : (
                <p>No reminder date provided</p>
                )}
            <div className="button" onClick={() => deleteReminder(reminder._id)}>
                Delete
            </div>
        </div>
      ))}

        </div>
      </div>
    </div>
  );

}

export default App;
