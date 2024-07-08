
import './App.css';
import {Route, Routes} from "react-router-dom";
import MeetingSummarizer from './components/pages/MeetingSummarizer';

function App() {
  return (
     <Routes>
       <Route path='/'>
           <Route index element={<MeetingSummarizer/>}/>
       </Route>
     </Routes>
  );
}

export default App;
