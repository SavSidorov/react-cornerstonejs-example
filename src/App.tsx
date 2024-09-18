import React, { Suspense } from "react";
import './App.css';

const Viewer = React.lazy(() => import("./components/Viewer/Viewer"));

function App() {
  return (
    <div className="App">
      <p>wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'</p>
      <div className="flex justify-center items-start w-full p-4">
        <div className="w-[500px] h-[500px]">
          <Suspense fallback={<div>Loading...</div>}>
            <Viewer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
