import { useState } from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = () => {
  const [color, setColor] = useState("#fff"); // Initial color

  // Handle color change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeComplete = (color: any) => {
    setColor(color.hex); // Update the state with selected color
  };

  return (
    <div>
      <SketchPicker
        color={color} // Set the initial color
        onChangeComplete={handleChangeComplete} // Update on color change
        disableAlpha={true} // Show or hide the alpha slider
        presetColors={[]} // Color presets
        // triangle="top-left" // Position of the triangle selector
        width="300px" // Set custom width
      />
      <p>Selected color: {color}</p>
    </div>
  );
};

export default ColorPicker;
