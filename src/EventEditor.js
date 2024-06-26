import React, { useState, useEffect } from 'react';
import Editor from './Editor';
import { adjustDateForSubmit } from './utils.js';

// Template for the edit form. It may be easier to modify
// an object (future JSON?) and have dynamic form-field code
// as opposed to directly modifying the form-field code when
// fields change.
// Each object must have:
//   label:string Displayed as the field label the user sees.
//   name:string Form-field name. Should be unique.
//   fieldType:string Type of field displayed
//        (["text"|"select"|"date"|"time"|"textarea"])
//   data:string If the fieldType is "select", the dropdown is
//        populated with data from this property.
//   dataList:string If the fieldType is "text", this is the ID of the
//        datalist element to use for hinting.
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

  // Submittal functions

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

  const addAppointment = (formData) => {
    let data = adjustDateForSubmit(formData);
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

  const updateAppointment = (formData) => {
    let data = adjustDateForSubmit(formData);
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


  // HTML
  return (
    <Editor itemName="Event"
            formTemplate={EventTemplate}
            data={eventData}
            generalData={generalData}
            callbacks={{
              addFunc: addAppointment,
              editFunc: updateAppointment,
              deleteFunc: deleteAppointment,
              closeFunc: closeFunc}
            } ></Editor>
  );
}
export default EventEditor;