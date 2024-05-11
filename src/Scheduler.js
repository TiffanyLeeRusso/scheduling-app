import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import * as bootstrap from '../node_modules/bootstrap/dist/js/bootstrap.esm.min.js'
import EventEditor from './EventEditor';
import './Scheduler.css';

/*
Definitions:
Users: Users of this app. Also potentially providers of services.
Clients: People requesting services from users.
Services: Items that take time and are billable. Users provide these services to clients.
Appointments: The events where users provide clients with services.
AppointmentServices: An n to m link between Appointments and Services,
  listing services for each appointment, since there is a one-to-many 
  relationship between appointments and services. One appointment may
  have more than one service requested/provided.

Additional Features (TODO):
* Add/edit users
* Add/edit clients
* Access control. All users may not require full R/W access to all DB tables. Perhaps not all users provide services; some may just handle appointments. Perhaps there is designated IT/admin user(s).
* Availability. Each user can update their availability for when they are able to provide services.
*/

/*
Technical TODOs
Add a select to show appointments by user (experience: choose a user, filtering events by user)
Add a select to show appointments by client (experience: choose a client, filtering events by client)
Add confirmation to delete
Add messages for add, edit, delete success
Add TypeScript?
Add Redux?
*/

const Scheduler = ({updateUserMessage}) => {

  // Variables
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentServices, setAppointmentServices] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  const calendarView = useRef("dayGridMonth"); // dayGridMonth,timeGridWeek,listWeek

  // Functions

  // fetchData
  // dataType:string The URL for the backend; also used for the error message
  // parse:boolean JSON.parse or not
  // setFunc:Function callback to the set-state function for this data.
  const fetchData = (dataType, parse, setFunc) => {
    // This is the flask server url
    fetch("http://localhost:5000/" + dataType, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // PROD_REMOVE
        }
    }).then((res) => res.json()
        .then((result) => {
          if(result.status === "200" &&
             typeof(result.data) !== "undefined") {
            const data = parse ? JSON.parse(result.data) : result.data;
            setFunc([...data]);
          } else {
            setError("Error: Could not retrieve data.");
            console.error(`Scheduler::fetch ${dataType} got result ${result.status}.`);
          }
      })
    );
  };

  // TODO: Redux this stuff. Passing all this data around is no bueno.
  const fetchUsers = () => { fetchData("users", true, setUsers); };
  const fetchClients = () => { fetchData("clients", true, setClients); };
  const fetchServices = () => { fetchData("services", false, setServices); };
  const fetchAppointments = () => { fetchData("appointments", false, setAppointments); };
  const fetchAppointmentServices = () => { fetchData("appointment_services", true, setAppointmentServices); };
  const fetchAll = () => {
    fetchUsers();
    fetchClients();
    fetchServices();
    fetchAppointments();
    fetchAppointmentServices();
  }

  const renderSchedule = () => {
    if(appointments.length > 0) {
      //console.log("users", users); console.log("clients", clients); console.log("appointments", appointments); console.log("services", services); console.log("appointmentServices", appointmentServices);

      // Sort appointments by start_time (seems unnecessary when we dump the events into the calendar lib)
      //appointments.sort((a, b) => { return new Date(a.start_time) - new Date(b.start_time); });

      // Events array for the FullCalendar calendar
      // Contains objects with props title, start, end, etc.: https://fullcalendar.io/docs/event-parsing
      let events = []; 
      appointments.forEach((ap) => {
        // Find corresponding data from the other arrays
        let client = clients.find((el) => { return el.id === ap.client_id; }) || {};
        let user = users.find((el) => { return el.id === ap.user_id; }) || {};
        let serviceNames = [];
        let serviceList = [];
        for(let apServ of appointmentServices) {
          if(ap.id === apServ.appointment_id) {
            let s = services.find((service) => { return apServ.service_id === service.id; });
            serviceList.push(s);
            serviceNames.push(s.name);
          }
        }

        let description = `<div>Client: ${client.name}</div><div>User: ${user.name}</div><div>Reason: ${serviceNames.join(', ')}</div>`;
        // The event object here is what we pass to EventEditor
        let event = { appointment: ap, client: client, user: user, services: serviceList }

        events.push({
            title: client.name,
            extendedProps: {description: description, event: event},
            start: new Date(ap.start_time),
            end: new Date(ap.end_time),
            interactive: true,
            editable: true
        });
      });

      // FullCalendar.io calendar init
      let calendarEl = document.getElementById('calendar');
      let calendar = new Calendar(calendarEl, {
        plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ],
        initialView: calendarView.current,
        timeZone: 'UTC',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        datesSet: function (dateInfo) {
          // Save the current view for the next rerender
          calendarView.current = dateInfo.view.type;
        },
        /* Tooltip does not disappear on event click so it is disabled for now
        eventDidMount: (info) => {
          let tooltip = new bootstrap.Tooltip(info.el, {
            title: info.event.extendedProps.description,
            placement: 'top',
            trigger: 'hover',
            container: 'body',
            html: true
          });
        },/**/
        eventClick: editEvent,
        events: events
      });

      calendar.render();

    } else {
      return (
        <div>No data to display.</div>
      );
    }
  };

  const closeEventEditor = () => {
    setShowEditor(false);
    fetchAll();
  }

  const addEvent = () => {
    setShowEditor(false); // Make sure EventEditor refreshes in case it is already open
    setCurrentEvent(null);
    requestAnimationFrame(() => { setShowEditor(true); });
  };

  const editEvent = (e) => {
    setShowEditor(false); // Make sure EventEditor refreshes in case it is already open
    setCurrentEvent(e.event.extendedProps.event);
    requestAnimationFrame(() => { setShowEditor(true); });
  };

  /*
  // USER SELECT
  const renderUserOptions = () => {
    let options = [];
    users.forEach((option) => 
      options.push(<option key={option.id} value={option.id}>{option.name}</option>)
    );
    return options;
  };
  */

  // Component init
  useEffect(() => {
    setError("");
    fetchAll();
    renderSchedule();
  }, []);

  // HTML
  return (
    <div className="scheduling">
      <button className="btn btn-primary add-btn" onClick={addEvent}>Add Event</button>
      { showEditor && 
        <EventEditor eventData={currentEvent || null}
                     generalData={{ users: users, clients: clients, services: services }}
                     updateUserMessage={updateUserMessage}
                     closeFunc={closeEventEditor} />
      }
      {/*USER SELECT <label>
        <div>Filter schedule by user</div>
        <select>
        {renderUserOptions()}
        </select>
      </label>*/}
      <div id="calendar"></div>
      { renderSchedule() }
      { error.length > 0 ? 
        (<>
         <div className="error">{error}</div>
         <button onClick={fetchAll}>Try Again</button>
         </>
        )
        :
        null
      }
    </div>
  );
}
export default Scheduler;