import "./App.css";
import poster from "./images/CarteSign.png";
import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
const App = () => {
  let padRef = useRef({});
  const [dataURL, setDataURL] = useState("");

  const clear = () => {
    padRef.current?.clear();
  };

  const trim = () => {
    var url = "";
    url = padRef.current?.getCanvas().toDataURL("image/png");
    setDataURL(url);
    console.log(url);
    //addInput(JSON.stringify({ method: "create_nft", payload: String(url) }));
  };

  return (
    <div className="App">
      <img src={poster} style={{ width: "100%" }} alt="poster" />
      <h2 style={{ alignSelf: "center" }}>Signature Pad</h2>
      <div>
        <div style={{ backgroundColor: "grey" }}>
          <SignaturePad
            ref={padRef}
            canvasProps={{
              className: "sigCanvas",
              width: 1500,
              height: 300,
            }}
          />
        </div>
        <div className="sigPreview">
          <button onClick={trim}>Register</button>
          <button onClick={clear}>Clear</button>
        </div>
        <div style={{ backgroundColor: "magenta" }}>
          {dataURL ? (
            <img
              className={"sigImage"}
              src={dataURL}
              alt="user generated signature"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;
