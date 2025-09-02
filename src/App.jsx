import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import Home from "./components/Home";
import Filter from "./components/Filter";
import Download from "./components/Download";

const App = () => {
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Home -> "/" */}
      <Route path="/" element={<Home onStart={() => navigate("/filter")} />} />

      {/* Filter -> "/filter" */}
      <Route
        path="/filter"
        element={
          <Filter
            onPhotosCaptured={(photos) => {
              setCapturedPhotos(photos);
              navigate("/download");
            }}
          />
        }
      />

      {/* Download -> "/download" */}
      <Route
        path="/download"
        element={
          <Download
            photos={capturedPhotos}
            onRetake={() => navigate("/filter")}
          />
        }
      />
    </Routes>
  );
};

export default App;
