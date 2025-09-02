import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

const Filter = ({ onPhotosCaptured }) => {
  const webcamRef = useRef(null);

  // UI state
  const [filter, setFilter] = useState("none");
  const [facingMode, setFacingMode] = useState("user");
  const [timer, setTimer] = useState(0);
  const [burstCount, setBurstCount] = useState(1);
  const [countdown, setCountdown] = useState(null);
  const [imgSrc, setImgSrc] = useState([]);

  const [showTimer, setShowTimer] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  // NEW: keep the latest filter in a ref so burst uses whatever you pick between shots
  const filterRef = useRef(filter);
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const filters = [
    { name: "Normal", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Blur", value: "blur(3px)" },
    { name: "Bright", value: "brightness(1.5)" },
    { name: "Contrast", value: "contrast(2)" },
    { name: "Invert", value: "invert(100%)" },
    { name: "Hue Rotate", value: "hue-rotate(90deg)" },
  ];

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // Capture a single photo with the CURRENT filter at capture time
  const capturePhoto = () => {
    if (!webcamRef.current || !webcamRef.current.video) return null;

    const video = webcamRef.current.video;

    // Ensure the video has data
    if (video.readyState < 2) return null; // HAVE_CURRENT_DATA

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");

    // Use latest filter from ref (not the possibly stale state)
    ctx.filter = filterRef.current;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  // Burst + timer flow that allows changing filters between shots
  const startCapture = async () => {
    const capturedPhotos = [];

    for (let i = 0; i < burstCount; i++) {
      // Per-shot timer/countdown
      if (timer > 0) {
        for (let t = timer; t > 0; t--) {
          setCountdown(t);
          await delay(1000);
        }
        setCountdown("😊 Smile!");
        await delay(800);
        setCountdown(null);
      }

      // Take the shot with whatever filter is selected *right now*
      const photo = capturePhoto();
      if (photo) {
        capturedPhotos.push(photo);
        setImgSrc((prev) => [...prev, photo]);
      }

      // Give user time to switch the filter before the next shot
      if (i < burstCount - 1) {
        await delay(1000); // adjust if you want more/less time to switch filters
      }
    }

    // Send all burst photos back to parent
    if (typeof onPhotosCaptured === "function" && capturedPhotos.length) {
      onPhotosCaptured(capturedPhotos);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="camera">
      <div className="camera_box">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          className="camera_box_area"
          // Keep visual preview filter for the live camera
          style={{ filter }}
        />

        {countdown !== null && (
          <div className="countdown-overlay">{countdown}</div>
        )}

        {/* Snapchat-style horizontal filter carousel */}
        <div className="filter-carousel">
          {filters.map((f, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => setFilter(f.value)}
              style={{
                border:
                  filter === f.value
                    ? "2px solid #f666"
                    : "2px solid transparent",
              }}
            >
              {f.name}
            </div>
          ))}
        </div>

        {/* Capture, Switch, Timer & Burst */}
        <div className="camera_box_click">
          {/* Timer Button */}
          <div className="control_wrapper">
            <div
              className="control_button"
              onClick={() => setShowTimer((s) => !s)}
            >
              ⏱ {timer === 0 ? "Off" : `${timer}s`}
            </div>
            {showTimer && (
              <div className="control_dropdown">
                {[0, 3, 5, 10].map((t) => (
                  <div
                    key={t}
                    className="dropdown_item"
                    onClick={() => {
                      setTimer(t);
                      setShowTimer(false);
                    }}
                  >
                    {t === 0 ? "Off" : `${t}s`}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main capture button */}
          <div className="camera_button_pic" onClick={startCapture}>
            📸
          </div>

          {/* Switch camera */}
          <div className="camera_button_switch" onClick={switchCamera}>
            🔄
          </div>

          {/* Burst Button */}
          <div className="control_wrapper">
            <div
              className="control_button"
              onClick={() => setShowBurst((s) => !s)}
            >
              ⚡ {burstCount}
            </div>
            {showBurst && (
              <div className="control_dropdown">
                {[1, 3, 5].map((b) => (
                  <div
                    key={b}
                    className="dropdown_item"
                    onClick={() => {
                      setBurstCount(b);
                      setShowBurst(false);
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Captured Images Preview */}
        <div className="captured_images">
          {imgSrc.map((img, idx) => (
            <img key={idx} src={img} alt={`capture-${idx}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filter;
