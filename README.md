# Scheduling App

A basic scheduling app utilizing FullCalendar.io for display. Add/edit/delete event functionality included. Written for practice/fun with MySql, Python Flask, React, and Bootstrap.

*This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).*

## Setup

Make sure you have Node.js and Python installed in your environment. Tested with Node v20.12.2, npm version 10.5.0,  and Python 3.12.3.

### Database
Tested with MySQL v8.0.36.
Run the *db.sql* script to create the DB in your SQL server.
Run the *data.sql* script to add some initial mock data to your DB.

Start the DB service.\
For MySQL on Windows (ugh, I know), if during install you allowed
MySQL to run as a Windows service, open a cmd prompt in administrator 
mode and run (for version 8.0.*):

`$ net run mysql80`

To get the exact name of your service, click the Windows/Start menu and search "Services". A "MySQL#" service should be listed in the Services window.

### Backend

#### Install Flask
Use one of the following commands to install Flask if you do not already have it: \
`$ pip install Flask` \
`$ py -m pip install flask`

#### Start the backend server
Open a terminal and run the following command. The process will not exit until Ctrl+C. Python "print" statements will appear in this terminal (for debugging) and script updates are handled automatically. Python errors will end the server process; make sure to run this command again if you create an error.

`$ py run.py`

### Frontend

#### Install all the things
You know the drill.\
`$ cd scheduling-app`\
`$ npm install`\
*sips coffee*

#### Start react-scripts
Run the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

`$ cd scheduling-app`\
`$npm start`

## Other Scripts

In the project directory, you can run:

### `npm test`

No tests yet. I guess you can still run it, though ¯\\_(ツ)_/¯

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## TODO
What kind of side project doesn't have TODOs?

Additional-Features Ideas
* Add/edit users
* Add/edit clients
* Access control. All users may not require full R/W access to all DB tables. Perhaps not all users provide services; some may just handle appointments. Perhaps there is designated IT/admin user(s).
* Availability. Each user can update their availability for when they are able to provide services. Need a new DB table for user availability.

Technical TODOs
* Add a select to show appointments by user (experience: choose a user, filtering events by user)
* Add a select to show appointments by client (experience: choose a client, filtering events by client)
* Add confirmation to delete
* Add messages for add, edit, delete success
* Add TypeScript
* Add Redux
