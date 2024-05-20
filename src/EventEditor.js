import React, { useState, useEffect, useRef } from 'react';
import './EventEditor.css';

// Template for the edit form. It may be easier to modify
// an object (future JSON?) and have dynamic form-field code
// as opposed to directly modifying the form-field code when
// fields change.
// Each object must have:
//   label:string Displayed as the field label the user sees.
//   name:string Form-field name
//   fieldType:string Type of field displayed
//        (["text"|"select"|"date"|"time"|"textarea"])
//   data:string If the fieldType is "select", the dropdown is
//        populated with data from this property.
//   skipEmptyVal:boolean If fieldType is "select", the dropdown is
//        populated first with an empty option. Do not render an empty
//        option if this val is true.
//   required:boolean If this field is required for submittal.
//   props:Array<obj> Additional props to add to the form field.
//        E.g., a textarea can have a maxlength prop so: props: { "maxlength": "256" }
//   value:any Initial value of this field. Set programmatically; not here.

// TODO: Maybe this definition could be a separate JSON file
// loaded on app init so it is not buried in the code.
// Or maybe we could incorporate it in the app so we can use
// TypeScript to better define the objects and their possible values?
const EventTemplate = [
  {
    label: "Client",
    name: "client_id",
    fieldType: "select",
    data: "clients",
    required: true
  },
  {
    label: "User",
    name: "user_id",
    fieldType: "select",
    data: "users",
    required: true
  },
  {
    label: "Date",
    name: "date",
    fieldType: "date",
    required: true
  },
  {
    label: "Start Time",
    name: "start_time",
    fieldType: "time",
    required: true
  },
  {
    label: "End Time",
    name: "end_time",
    fieldType: "time",
    required: true
  },
  {
    label: "Services",
    name: "services",
    fieldType: "select",
    data: "services",
    required: false,
    skipEmptyVal: true,
    props: { "multiple": true }
  },
  {
    label: "Notes",
    name: "notes",
    fieldType: "textarea",
    required: false,
    props: { "maxLength": 256 }
  },
  {
    label: "Price Charged",
    name: "price_charged",
    fieldType: "text",
    required: false
  }
];

const EventEditor = ({eventData, generalData, updateUserMessage, closeFunc}) => {
  // Variables
  const [addMode, setAddMode] = useState(true); // TODO: use enum to define modes?
  const [title, setTitle] = useState("Add Event");
  const [formData, setFormData] = useState({});
  const keyNum = useRef(0);

  // Functions
  const fillForm = () => {
    let initFormData = {};

    if(eventData === null) {
      setAddMode(true);
      setTitle("Add Event");
      for(let field of EventTemplate) {
        initFormData[field.name] = "";
      }

    } else {
      setAddMode(false);
      setTitle("Edit Event");
      // Add initial values from the eventData
      let date = "";
      EventTemplate.forEach((field) => {
        let val = eventData.appointment[field.name] || "";
        if(field.name === "start_time" || field.name === "end_time") {
          let d = (new Date(val)).toISOString();
          val = d.substring(11,16);
          date = d.substring(0,10);
        } else if(field.name === "services") {
          val = eventData.services.map(service => service.id);
        } else if(field.name === "date") {
          return;
        }
        initFormData[field.name] = val;
      });
      // bleh. Date is contained in start_time/end_time but the date field is before start & end time..
      initFormData["date"] = date;
    }

    setFormData(initFormData);
  }
  
  const adjustDateForSubmit = () => {
    let data = JSON.parse(JSON.stringify(formData));
    let date = data.date;
    delete data.date;
    data.start_time = `${date} ${data.start_time}`;
    data.end_time = `${date} ${data.end_time}`;
    return data;
  }

  const deleteAppointment = () => {
    fetch("http://localhost:5000/appointments", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "appointment_id": eventData.appointment.id
        })
    }).then((res) => res.json()
        .then((result) => {
          if(result.status !== "200") {
            updateUserMessage("Error: Could not delete appointment.", true);
            console.error(`EventEditor::deleteAppointment got result ${result.status}.`);
          } else {
            updateUserMessage("Deleted appointment");
            closeFunc();
          }
      })
    );
  };

  const addAppointment = () => {
    let data = adjustDateForSubmit();
    fetch("http://localhost:5000/appointments", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((res) => res.json()
        .then((result) => {
          if(result.status !== "200") {
            updateUserMessage("Error: Could not add appointment.", true);
            console.error(`EventEditor::addAppointment got result ${result.status}.`);
          } else {
            updateUserMessage("Added appointment");
            closeFunc();
          }
      })
    );
  };

  const updateAppointment = () => {
    let data = adjustDateForSubmit();
    data["appointment_id"] = eventData.appointment.id;
    fetch("http://localhost:5000/appointments", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then((res) => res.json()
      .then((result) => {
        if(result.status !== "200") {
          updateUserMessage("Error: Could not update appointment.", true);
          console.error(`EventEditor::updateAppointment got result ${result.status}.`);
        } else {
          updateUserMessage("Updated appointment");
          closeFunc();
        }
      })
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };
  
  const handleSelectChange = (e) => {
    let options = e.target.options;
    let value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    if(value.length === 1) { value = value[0]; }
    const { name } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));    
  };

  const renderField = (field) => {
    let props = field.props || {};
    if(field.required) { props["required"] = true; }

    switch(field.fieldType) {
      case "text":
      return <label><div className="label">{field.label}</div><input type="text" name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;

      case "textarea":
      return <label><div className="label">{field.label}</div><textarea name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;

      case "select":
      let sortedOptions = generalData[field.data].sort((a, b) => { return a.name > b.name; });
      return (
        <label>
          <div className="label">{field.label}</div>
          <select name={field.name} value={formData[field.name]} onChange={handleSelectChange} {...props}>
            {field.skipEmptyVal ? null : <option></option>}
            { sortedOptions.map((data) => <option value={data.id} key={`${field.name}${keyNum.current++}`}>{data.name}</option>) }
          </select>
        </label>
        );

      case "date":
      return <label><div className="label">{field.label}</div><input type="date" name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;

      case "time":
      return <label><div className="label">{field.label}</div><input type="time" name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;
    };
  };


  const renderFormFields = () => {
    let fields = [];
    EventTemplate.forEach(field => fields.push(renderField(field)));
    return fields;
  };

  // Component init
  useEffect(() => {
    fillForm();
    requestAnimationFrame(() => {
      document.querySelector(".eventEditor")?.scrollIntoView();
      document.querySelector('form input:not([type=hidden]),select:not([type=hidden]),textarea:not([type=hidden])')?.focus();
    });
  }, []);


  // HTML
  return (
    <div className="eventEditor">
      <h2 className="title">{title}</h2>
      <button className="btn btn-secondary close-btn" aria-label="Close" onClick={closeFunc}>X</button>
      <form id="eventEditorForm">
        { renderFormFields() }
      </form>
      <div className="btn-row">
        { !addMode && <button className="btn btn-primary" onClick={deleteAppointment}>Delete</button> }
        <button className="btn btn-primary" onClick={addMode ? addAppointment : updateAppointment}>Save</button>    
      </div>
    </div>
  );
}
export default EventEditor;