// utilities.js

export function getClientIdFromName (name, clients) {
  return clients.find((client) => client.name.toLowerCase() === name.toLowerCase())?.id || "";
};

export function getClientFromName (name, clients) {
  return clients.find((client) => client.name.toLowerCase() === name.toLowerCase()) || null;
};

export function adjustDateForSubmit(formData) {
  let data = JSON.parse(JSON.stringify(formData));
  let date = data.date;
  delete data.date;
  data.start_time = `${date} ${data.start_time}`;
  data.end_time = `${date} ${data.end_time}`;
  return data;
};

