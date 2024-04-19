import React from 'react';
import Scheduler from './Scheduler';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
      <>
      <header>
        <h1>Scheduling</h1>
      </header>
      <div className="main-container">
        <main>
          <Scheduler/>
        </main>
        <footer>
          <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
        </footer>
      </div>
      </>
    );
}

export default App;