import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const Home = ({ onStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const fireConfetti = () => {
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
    setTimeout(() => {
      confetti({ particleCount: 150, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);
  };

  const handleClick = () => {
    if (!candlesLit) {
      onStart(); // Navigate to Filter after blow
    } else {
      setIsOpen(true);
    }
  };

  // Blow detection
  useEffect(() => {
    if (!isOpen || !candlesLit) return;

    const initMic = async () => {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const detectBlow = () => {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const volume =
          dataArrayRef.current.reduce((a, b) => a + b, 0) / bufferLength;
        if (volume > 60 && candlesLit) {
          setCandlesLit(false);
          fireConfetti();
          if (audioRef.current) audioRef.current.play();
        }
        requestAnimationFrame(detectBlow);
      };
      detectBlow();
    };

    initMic();
  }, [isOpen, candlesLit]);

  return (
    <div className="home">
      <div className="home_page">
        <div className={`home_page_box ${isOpen ? "open" : ""}`}>
          {isOpen && (
            <div className="birthday_content">
              <h1 className="birthday_title">🎉 Happy Birthday 🎉</h1>
              <p className="birthday_message">
                Wishing you laughter, love & happiness on your special day 💖
              </p>
              <div className="balloons">
                <span>🎈</span>
                <span>🎈</span>
                <span>🎂</span>
                <span>🎁</span>
              </div>

              <div className="cake">
                <div className="cake_layer chocolate"></div>
                <div className="cake_layer icing"></div>
                <div className="cake_layer chocolate"></div>
                <div className="candles">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="candle">
                      <div
                        className={`flame ${candlesLit ? "lit" : "out"}`}
                      ></div>
                    </div>
                  ))}
                </div>
                <p className="cake_text">
                  {candlesLit
                    ? "Blow into your mic to blow the candles! 🎂"
                    : "✨ Make a Wish! ✨"}
                </p>
              </div>
              <audio ref={audioRef} src="/assets/birthday_song.mp3" />
            </div>
          )}
        </div>

        <div className="home_page_button">
          <div className="home_page_button_start" onClick={handleClick}>
            {candlesLit ? (isOpen ? "Start" : "Open") : "Next →"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
