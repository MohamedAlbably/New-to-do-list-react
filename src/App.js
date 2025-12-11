import './App.css';
import { useState, useRef, useEffect } from 'react';

function App() {
  const [dark , setDark] = useState (localStorage.getItem("dark") === 'true');
  const  [todos, setTodos] = useState([]); 
  const [search, setSearch] = useState("");
  const [time , settime] = useState('');
  const [show , setshow] = useState (false);
  const [alertmsg , setalertmsg]= useState ('');
  const [open , setOpen] = useState (true);
  
  //load from local storage
   useEffect(() => {
  try {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  } catch (e) {
    console.error("Bad todos data:", e);
    localStorage.removeItem("todos");
  }
}, []);

  //save to local storage
  useEffect(() => {
  if (todos.length > 0) {
    localStorage.setItem("todos", JSON.stringify(todos));
  }
}, [todos]);

  const inputref = useRef();
  const createdRef = useRef();
  const deadlineRef = useRef();
  const priorityRef = useRef();
  const alertRef = useRef();


  const handleClick = () => {
    const text = inputref.current.value;
    const createdAt = createdRef.current.value;
    const deadline = deadlineRef.current.value;
    const priority = priorityRef.current.value;
    const newItem =
    {
     createdAt, 
     deadline , 
     text, 
      priority,
     complete: false 
    };

  setTodos([...todos, newItem]);
  inputref.current.value = "";
  createdRef.current.value = "";
  deadlineRef.current.value = "";
};

  const handleDone = (index) => {
    const newTodos = [...todos];
    newTodos[index].complete = !newTodos[index].complete;
    setTodos(newTodos);
  }
  

  const handleDelete = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  }
function formatDate(dateString) {
  if (!dateString || dateString === "N/A") return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


  // Sort Buttons
  const sortByCreated = () => {
    const sorted = [...todos].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    setTodos(sorted);
  };

  const sortByDeadline = () => {
    const sorted = [...todos].sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );
    setTodos(sorted);
  };

  const sortByStatus = () => {
    const sorted = [...todos].sort((a, b) => a.complete - b.complete);
    setTodos(sorted);
  };


  //search function
   const filteredTodos = todos.filter(todo =>
  (todo.text || "").toLowerCase().includes((search || "").toLowerCase())
);

//conter
const total = todos.length;
const complete = todos.filter(todo => todo.complete).length;
const panding = total - complete;

    

//local time 
useEffect(() => {
  const interval = setInterval(() => {
    const cairoTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" });settime(cairoTime);
  }, 1000);
  return () => clearInterval(interval);
}, []);

//scroll to bottom when new task added
useEffect(() => { 
  const handlescroll = () => {
    setshow(window.scrollY > 100);}
    window.addEventListener('scroll' , handlescroll);
  }, []);

  const scrollTotop = () => {
    window.scrollTo ({ top:0 , behavior:'smooth'});
  }

  function deadlinecolor (deadline){ 
    if (!deadline) return "";
    const now = new Date ();
    const end = new Date (deadline);
    const diff = end -now;
    const hours = diff / (1000* 60 *60);

    if (hours <= 24) return "red";
    if (hours <= 48) return "orange";
    return "";
  }


  // deadline alert 
  useEffect (() =>{
    const interval = setInterval (() => {
      todos.forEach (todo => {
        if (!todo.deadline) return;

        const diff = new Date (todo.deadline) - new Date ();
        const hours = diff / (100 *60 *60);

        if (hours <= 1 && hours > 0 ){
          setalertmsg (`⏳ Task "${todo.text}" is due within an hour!`);
        }
      });
  }, 60000);
  return () => clearInterval(interval);
  }, [todos]);
//dark mode
  useEffect (() => {
    if (dark) {
      document.body.classList.add ('dark-mode');
    } else {
      document.body.classList.remove ('dark-mode');
    }
  }, [dark])


  // close alert when clicking outside
useEffect(() => {
  function handleClickOutside(e) {
    if (alertRef.current && !alertRef.current.contains(e.target)) {
      setalertmsg(""); // يقفل الأليرت
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


 return (
    <div className={`App ${dark ? 'dark-mode' : 'light-mode'}`}>

      <div className={`sideBar ${open ? 'open' : 'closed'}`}>

        {/* dark mode */}
        <div 
  className="toggle-wrapper" 
  onClick={() => {
    setDark(!dark);
    localStorage.setItem("dark", !dark);
  }}
>
  <div className={`toggle ${dark ? "dark" : ""}`}>
    <span className="icon">
      {dark ? "🌙" : "☀️"}
    </span>
  </div>
</div>

      {/* Search Bar */}
       <input className='search' type="text" placeholder="Search tasks..." onChange={(e) => setSearch(e.target.value)} value={search} />


      {/* local time */}
      <p className='time'>(Cairo): {time} </p>

      {/* counter */}
     <p className='counter'>tasks: total: {total} | complete: {complete} | pending: {panding} </p>
         </div>

       <button className="toggle-btn" onClick={() => setOpen(!open)}>
        {open ? "◀" : "▶"}
      </button>

     <h2>To Do List</h2>

    

      {show && <button className={`toTop ${dark ? "btn-dark" : "btn-light"}`} onClick={scrollTotop}>👆🏽</button>}

     

      {alertmsg && <div ref={alertRef} className='alert'>{alertmsg}</div>}

     

      <input ref={inputref} type="text" placeholder="Add a new task" />

        {/* تاريخ إنشاء المهمة */}
         <label className='warrep'>Start Time</label>
        <input ref={createdRef} type="datetime-local" />

        {/* ميعاد الانتهاء Deadline */}
         <label className='warrep'>deadline Time</label>
        <input ref={deadlineRef} type="datetime-local" />

        <label className='warrep'>Priority Level</label>
        <select ref={priorityRef} defaultValue='low' className={`priority ${dark ? "btn-dark" : "btn-light"}`}>
          <option className='level' value="low">Low</option>
          <option className='level' value="medium">Medium</option>
          <option className='level' value="high">High</option>
          </select> 

      <button className={`add ${dark ? "btn-dark" : "btn-light"}`} onClick={handleClick}>Add Task</button>

       {/* Sorting buttons */}
      <div className={`sort`} style={{ margin: "10px 0" }}>
        <button className={`sorting ${dark ? "btn-dark" : "btn-light"}`} onClick={sortByCreated}>Sort by Created</button>
        <button className={`sorting ${dark ? "btn-dark" : "btn-light"}`} onClick={sortByDeadline}>Sort by Deadline</button>
        <button className={`sorting ${dark ? "btn-dark" : "btn-light"}`} onClick={sortByStatus}>Sort by Status</button>
      </div>

   <ul>
  {filteredTodos.map(({ text, complete, createdAt, deadline, priority}, index) => {
        let opportunity = "";
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate - now;

      if (diffMs <= 0) {
        opportunity = "time is up";
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        opportunity = `${hours} hours and ${minutes} minutes`;
      }
    } else {
      opportunity = "N/A";
    }
    return (
      <div className='tasks' key={index}>
        <li
          onClick={() => handleDone(index)}
          className={complete ? "done" : ""}
          style={{ borderLeft: `6px solid ${deadlinecolor(deadline)}` }}
        >
          <div className={`circle${complete ? " checked" : ""}`}>
            {complete && <span className="checkmark">✓</span>}
          </div>

          <div className="task-text">{text}</div>

         <p>Priority: {priority}</p>


          <div className="dates">
            <p>Created: {formatDate(createdAt)}</p>
            <p className='end' style={{ color: deadlinecolor(deadline) }}>Deadline: {formatDate(deadline)}</p>
            <p>Opportunity: {opportunity}</p>
          </div>
        </li>

        <span className='delete-button' onClick={() => handleDelete(index)}>
          🗑️
        </span>
      </div>
    );
  })}
</ul>


    </div>
  );
}

export default App;
