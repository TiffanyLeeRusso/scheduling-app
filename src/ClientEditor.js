import React, { useState, useEffect } from 'react';
import Editor from './Editor';


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
const ClientTemplate = [
  {
    label: "Name",
    name: "name",
    fieldType: "text",
    required: true
  },
  {
    label: "Phone",
    name: "contact_phone",
    fieldType: "text",
    required: false
  },
  {
    label: "Email",
    name: "contact_email",
    fieldType: "text",
    required: true
  },
  {
    label: "Notes",
    name: "notes",
    fieldType: "textarea",
    required: false,
    props: { "maxLength": 256 }
  }
];

const ClientEditor = ({clientData, updateUserMessage, closeFunc}) => {

  // Submittal functions

  const deleteClient = () => {
    fetch("http://localhost:5000/clients", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "client_id": clientData.id
        })
    }).then((res) => res.json()
        .then((result) => {
          if(result.status !== "200") {
            updateUserMessage("Error: Could not delete client.", true);
            console.error(`ClientEditor::deleteClient got result ${result.status}.`);
          } else {
            updateUserMessage("Deleted client");
            closeFunc();
          }
      })
    );
  };

  const addClient = (formData) => {
    fetch("http://localhost:5000/clients", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then((res) => res.json()
        .then((result) => {
          if(result.status !== "200") {
            updateUserMessage("Error: Could not add client.", true);
            console.error(`ClientEditor::addClient got result ${result.status}.`);
          } else {
            updateUserMessage("Added client");
            closeFunc();
          }
      })
    );
  };

  const updateClient = (formData) => { console.log(formData)
    formData["client_id"] = clientData.id;
    fetch("http://localhost:5000/clients", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }).then((res) => res.json()
      .then((result) => {
        if(result.status !== "200") {
          updateUserMessage("Error: Could not update client.", true);
          console.error(`ClientEditor::updateClient got result ${result.status}.`);
        } else {
          updateUserMessage("Updated client");
          closeFunc();
        }
      })
    );
  };


  // HTML
  return (
    <Editor itemName="Client"
            formTemplate={ClientTemplate}
            data={clientData}
            generalData={null}
            callbacks={{
              addFunc: addClient,
              editFunc: updateClient,
              deleteFunc: deleteClient,
              closeFunc: closeFunc}
            } ></Editor>
  );
}
export default ClientEditor;