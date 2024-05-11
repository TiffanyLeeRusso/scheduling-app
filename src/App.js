import React, { useState } from 'react';
import Scheduler from './Scheduler';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  
  // TODO: Put the user message in Redux and do not pass updateUserMessage around.
  const [userMessage, setUserMessage] = useState('');
  const [isError, setIsError] = useState(false); // If the user message is an error msg
  const [messageShowing, setMessageShowing] = useState(false);

  const updateUserMessage = (message, isError = false) => {
    setIsError(isError);
    setUserMessage(message);
    setMessageShowing(true);
  };

  return (
    <>
    <header>
      <h1>Scheduling</h1>
    </header>
    <div className="main-container">
      <main>
        <div className={`floatingMessage ${messageShowing ? '' : 'hidden'} ${isError ? 'error' : ''}`}
             onTransitionEnd={() => setMessageShowing(false)}>{userMessage}</div>
        <Scheduler updateUserMessage={updateUserMessage}/>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
      </footer>
    </div>
    </>
  );
}

export default App;