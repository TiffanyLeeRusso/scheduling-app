import React, { useState, useEffect, useRef } from 'react';
import './Editor.css';

/* Editor
 This component is a general editor
 Pass in the form inputs (and their default data values) you want displayed
 and the callback(s) on submittal.

 itemName:string The display name of the item we are adding or editing, e.g. "Event", "Client", etc.
 formTemplate:obj The object describing the form we will create here.
 data:obj|null The object with the default values with which to fill the form.
   Passing null will trigger "add" mode.
 generalData:obj|null The object containing data general to the system, e.g., services offered.
 callbacks:obj { addFunc, editFunc, deleteFunc, closeFunc }
*/

const Editor = ({itemName, formTemplate, data, generalData, callbacks}) => {
  // Variables
  const [addMode, setAddMode] = useState(true); // TODO: use enum to define modes?
  const [title, setTitle] = useState("");
  const [formData, setFormData] = useState({});
  const keyNum = useRef(0);

  // Functions
  const fillForm = () => {
    let initFormData = {};
console.log(data, formTemplate)
    if(data === null) {
      setAddMode(true);
      setTitle(`Add ${itemName}`);
      for(let field of formTemplate) {
        if(field.fieldType === "select" && field.props?.multiple) {
          initFormData[field.name] = [];
        } else {
          initFormData[field.name] = "";
        }
      }

    } else {
      setAddMode(false);
      setTitle(`Edit ${itemName}`);
      // Add initial values from the data      
      // TODO: Temporary check until this is updated for general purposes
      if(itemName === "Event") {
        let date = "";
        formTemplate.forEach((field) => {
          let val = data.appointment[field.name] || "";
          if(field.name === "start_time" || field.name === "end_time") {
            let d = (new Date(val)).toISOString();
            val = d.substring(11,16);
            date = d.substring(0,10);
          } else if(field.name === "services") {
            val = data.services.map(service => service.id);
          } else if(field.name === "date") {
            return;
          }
          initFormData[field.name] = val;
        });
        // bleh. Date is contained in start_time/end_time but the date field is before start & end time..
        initFormData["date"] = date;
        
      } else {
         formTemplate.forEach((field) => {
           let val = data[field.name] || "";
           initFormData[field.name] = val;
        });
      }
    }

    setFormData(initFormData);
  }

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
    if(value.length === 1) { value = [value[0]]; }
    const { name } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));    
  };

  const renderField = (field) => {
    let props = field.props || {};
    if(field.required) { props["required"] = true; }

    switch(field.fieldType) {
      case "text":
      return <label key={field.name}><div className="label">{field.label}</div><input type="text" name={field.name} value={formData[field.name]} list={field.dataList} onChange={handleChange} {...props} /></label>;

      case "textarea":
      return <label key={field.name}><div className="label">{field.label}</div><textarea name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;

      case "select":
      let sortedOptions = generalData[field.data].sort((a, b) => { return a.name > b.name; });
      return (
        <label key={field.name}>
          <div className="label">{field.label}</div>
          <select name={field.name} value={formData[field.name]} onChange={props?.multiple ? handleSelectChange : handleChange} {...props}>
            {field.skipEmptyVal ? null : <option key={`${field.name}_empty_${keyNum.current++}`}></option>}
            { sortedOptions.map((data) => <option value={data.id} key={`${field.name}_${data.name}_${keyNum.current++}`}>{data.name}</option>) }
          </select>
        </label>
        );

      case "date":
      return <label key={field.name}><div className="label">{field.label}</div><input type="date" name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;

      case "time":
      return <label key={field.name}><div className="label">{field.label}</div><input type="time" name={field.name} value={formData[field.name]} onChange={handleChange} {...props} /></label>;
    };
  };

  const renderFormFields = () => {
    // If the formData is not init'd yet, wait until next render.
    // Maybe the first renderFormFields should somehow go in a hook once formData is init'd
    // but for now we are calling this func from the HTML so just do this check.
    if(Object.keys(formData).length === 0) { return; }
    let fields = [];
    formTemplate.forEach(field => fields.push(renderField(field)));
    return fields;
  };

  // Component init
  useEffect(() => {
    fillForm();
    requestAnimationFrame(() => {
      document.querySelector(".editor")?.scrollIntoView();
      document.querySelector('form input:not([type=hidden]),select:not([type=hidden]),textarea:not([type=hidden])')?.focus();
    });
  }, []);


  // HTML
  return (
    <div className={`editor ${itemName}Editor`}>
      <h2 className="title">{title}</h2>
      <button className="btn btn-secondary close-btn" aria-label="Close" onClick={callbacks.closeFunc}>X</button>
      <form id="editorForm">
        { renderFormFields() }
      </form>
      <div className="btn-row">
        { !addMode && <button className="btn btn-primary" onClick={callbacks.deleteFunc}>Delete</button> }
        <button className="btn btn-primary" onClick={()=>{addMode ? callbacks.addFunc(formData) : callbacks.editFunc(formData); }}>Save</button>    
      </div>
    </div>
  );
}
export default Editor;