import { useState } from "react";
import { useSwipeable } from "react-swipeable";

const Download = ({ photos, onRetake }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const downloadAll = () => {
    photos.forEach((photo, i) => {
      const link = document.createElement("a");
      link.href = photo;
      link.download = `photo_${i + 1}.jpg`;
      link.click();
    });
  };

  const downloadSeparate = (photo, index) => {
    const link = document.createElement("a");
    link.href = photo;
    link.download = `photo_${index + 1}.jpg`;
    link.click();
  };

  const mergePhotos = async () => {
    if (!photos || photos.length === 0) return;

    const canvas = document.createElement("canvas");
    const width = 1200; // canvas width
    const height = 1200; // canvas height
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#f8f8f8");
    grad.addColorStop(1, "#e0e0e0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const padding = 15;
    const positions = [];

    // Generate positions with random sizes for a Pinterest/mosaic style
    const cols = 3; // 3 columns
    const cellWidth = (width - padding * (cols + 1)) / cols;

    let yOffsets = Array(cols).fill(padding);

    for (let i = 0; i < photos.length; i++) {
      const img = new Image();
      img.src = photos[i];
      await new Promise((res) => (img.onload = res));

      // Find the column with the smallest y offset
      const col = yOffsets.indexOf(Math.min(...yOffsets));
      const x = padding + col * (cellWidth + padding);

      // Randomize height slightly for a mosaic effect
      const ratio = img.height / img.width;
      const cellHeight = cellWidth * ratio * (0.8 + Math.random() * 0.4);

      const y = yOffsets[col];

      // Draw image with rounded corners
      const radius = 20;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + cellWidth - radius, y);
      ctx.quadraticCurveTo(x + cellWidth, y, x + cellWidth, y + radius);
      ctx.lineTo(x + cellWidth, y + cellHeight - radius);
      ctx.quadraticCurveTo(
        x + cellWidth,
        y + cellHeight,
        x + cellWidth - radius,
        y + cellHeight
      );
      ctx.lineTo(x + radius, y + cellHeight);
      ctx.quadraticCurveTo(x, y + cellHeight, x, y + cellHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, x, y, cellWidth, cellHeight);
      ctx.restore();

      // Optional: shadow
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, cellWidth, cellHeight);

      yOffsets[col] += cellHeight + padding;
    }

    // Optional: Add a title on top
    ctx.fillStyle = "#333";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("My Photo Collage", width / 2, 70);

    // Download the final collage
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "beautiful_collage.jpg";
    link.click();
  };

  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev)),
    onSwipedRight: () =>
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev)),
    trackMouse: true, // allows swipe with mouse drag too
  });

  return (
    <div className="download">
      <div className="download_body">
        {/* Image wrapper with swipe handling */}
        <div
          className="download_photo_wrapper"
          {...handlers}
          style={{ touchAction: "none" }}
        >
          <img
            src={photos[currentIndex]}
            alt={`capture-${currentIndex}`}
            className="download_photo_img"
          />

          {/* Buttons */}
          <div className="download_button">
            <div
              className="download_separate"
              onClick={() =>
                downloadSeparate(photos[currentIndex], currentIndex)
              }
            >
              Download
            </div>
            <div className="download_retake" onClick={onRetake}>
              Retake
            </div>
            <div className="download_pic_button" onClick={downloadAll}>
              Download All
            </div>
            <div className="download_merge_button" onClick={mergePhotos}>
              Merge
            </div>
          </div>

          {/* Arrow navigation for desktop */}
          {currentIndex > 0 && (
            <button
              className="nav-arrow left-arrow"
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              ⬅
            </button>
          )}
          {currentIndex < photos.length - 1 && (
            <button
              className="nav-arrow right-arrow"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
            >
              ➡
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="photo_counter">
          {currentIndex + 1}/{photos.length}
        </div>
      </div>
    </div>
  );
};

export default Download;
