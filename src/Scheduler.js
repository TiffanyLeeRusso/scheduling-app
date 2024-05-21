import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import * as bootstrap from '../node_modules/bootstrap/dist/js/bootstrap.esm.min.js'
import EventEditor from './EventEditor';
import './Scheduler.css';

export const CLIENT_DATA_LIST_ID = "clientDataList";

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
*/

const Scheduler = ({updateUserMessage}) => {

  // Variables
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]); // all appointments
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [appointmentServices, setAppointmentServices] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  const calendarView = useRef("dayGridMonth"); // dayGridMonth,timeGridWeek,listWeek
  const keyNum = useRef(0);
  const userFilterRef = useRef(); // reference to the filter inputs
  const clientFilterRef = useRef(); // references to the filter inputs
  // We define a tooltip delay so we can know how long to wait for the
  // tooltip to hide before updating the view for the editor.
  // If we do not wait for the tooltip to hide it will stay shown.
  const tooltipDelay = 0; // ms
  
  const FILTER_TYPE = {
    USER: 0,
    CLIENT: 1
  };

  // Functions

  // Fetch

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

  // Rendering

  // Calendar
  const renderSchedule = () => {
    //console.log("users", users); console.log("clients", clients); console.log("appointments", appointments); console.log("filteredAppointments", filteredAppointments); console.log("services", services); console.log("appointmentServices", appointmentServices);

    if(appointments.length > 0) {

      // Sort appointments by start_time (seems unnecessary when we dump the events into the calendar lib)
      //filteredAppointments.sort((a, b) => { return new Date(a.start_time) - new Date(b.start_time); });

      // Events array for the FullCalendar calendar
      // Contains objects with props title, start, end, etc.: https://fullcalendar.io/docs/event-parsing
      let events = []; 
      filteredAppointments.forEach((ap) => {
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
        let event = { appointment: ap, client: client, user: user, services: serviceList };

        events.push({
            title: client.name,
            extendedProps: {description: description, event: event,
                            tooltip: { popover: {} } // Obj in obj to so we can assign a value once we have the event element
                           },
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
        eventDidMount: (info) => {
          let tooltip = new bootstrap.Tooltip(info.el.parentElement, {
            title: info.event.extendedProps.description,
            placement: 'top',
            trigger: 'hover',
            container: 'body',
            html: true
          });
          info.event.extendedProps.tooltip.popover = tooltip
        },
        eventClick: (info) => {
          // Manually disable (in case the mouse is still on the event)
          // & hide all (in case the mouse moves to a near tooltip)
          // the tooltips or else they will stay shown
          events.forEach((event) => {
            if(event.extendedProps.tooltip.popover.disable) {
              event.extendedProps.tooltip.popover.disable();
              event.extendedProps.tooltip.popover.hide();
            }
          });
          editEvent(info);
          // Re-enable the tooltips.
          events.forEach((event) => {
            if(event.extendedProps.tooltip.popover.enable) {
              event.extendedProps.tooltip.popover.enable();
            }
          });
        },
        events: events
      });

      calendar.render();

    } else {
      return (
        <div>No data to display.</div>
      );
    }
  };

  // User select
  const renderUserOptions = () => {
    let options = [];
    users.forEach((user) => 
      options.push(<option key={`user${keyNum.current++}`} value={user.id}>{user.name}</option>)
    );
    return options;
  };

  // client data list
  const renderClientDataListOptions = () => {
    let options = [];
    clients.forEach((client) => 
      options.push(<option key={`client${keyNum.current++}`} value={client.name}/>)
    );
    return options;
  };

  // Add/Edit/Update

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

  // Filtering

  // helper func
  const getClientIdFromName = (name) => {
    return clients.find((client) => client.name.toLowerCase() === name.toLowerCase())?.id || "";
  };

  // userId, clientId: string or null to indicate we are not running that filter
  // aps: the appointment array on which to run the filter(s)
  const runAllFilters = (userId, clientId, aps) => {
    let filteredAps = [...aps];
    if(userId !== null && userId !== "") {
      filteredAps = aps.filter((ap) => ap.user_id.toString() === userId);
    }
    if(clientId !== null && clientId !== "") {
      filteredAps = aps.filter((ap) => ap.client_id.toString() === clientId);
    }
    setFilteredAppointments([...filteredAps]);
  };

  const filterAppointments = (e, filterType) => {
    switch(filterType) {
      case FILTER_TYPE.USER:
        runAllFilters(
          null,
          getClientIdFromName(clientFilterRef.current.value).toString(),
          e.target.value.length === 0 ? appointments : [...appointments.filter((ap) => ap.user_id.toString() === e.target.value)]);
      break;

      case FILTER_TYPE.CLIENT:
        runAllFilters(
          userFilterRef.current.value,
          null, 
          e.target.value.length === 0 ? appointments : [...appointments.filter((ap) => ap.client_id === getClientIdFromName(e.target.value))]);
      break;
    }
  };

  const clearFilter = (e) => {
    userFilterRef.current.value = "";
    clientFilterRef.current.value = "";
    setFilteredAppointments([...appointments]);
  };

  // Component init
  useEffect(() => {
    setError("");
    fetchAll();
  }, []);

  // appointments should update once on init
  useEffect(() => {
    clearFilter();
  }, [appointments]);
  
  useEffect(() => {
    renderSchedule();
  }, [filteredAppointments]);

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

      <fieldset className="scheduleFilters">
        <legend>Appointment Filters</legend>
        <div className="filter filterByUser">
          <label>
            <div>Filter schedule by user</div>
            <select ref={userFilterRef} onChange={(e) => { filterAppointments(e, FILTER_TYPE.USER); }}>
              <option></option>
              {renderUserOptions()}
            </select>
          </label>
        </div>
        <div className="filter filterByClient">
          <label>
            <div>Filter schedule by client</div>
            <input ref={clientFilterRef} list={CLIENT_DATA_LIST_ID} onChange={(e) => { filterAppointments(e, FILTER_TYPE.CLIENT); }}/>
          </label>
        </div>
        <button className="btn btn-primary" onClick={clearFilter}>Show all appointments</button>
      </fieldset>

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

      <datalist id={CLIENT_DATA_LIST_ID}>
        {renderClientDataListOptions()}
      </datalist>
    </div>
  );
}
export default Scheduler;