import React from "react";
import Card from "./components/Card";

import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App" style={{ display: "flex" }}>
      {Array.from(new Array(4)).map((e, i) => {
        return (
          <div>
            {Array.from(new Array(13)).map((e, j) => {
              return <Card Rank={j + 1} Suit={i} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default App;
