import { useState } from 'react';
import { SketchPicker } from 'react-color';

interface ColorPickerProps {
  color?: string;
  onColorChange: (color: string) => void;
}
const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange }) => {
  const [selectedColor, setSelectedColor] = useState(color || "#fff");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeComplete = (color: any) => {
    const newColor = color.hex;
    setSelectedColor(newColor);
    onColorChange(newColor); // Pass the new color to the parent component
  };

  return (
    <div>
      <SketchPicker
        color={selectedColor}
        onChangeComplete={handleChangeComplete}
        disableAlpha={true}
        presetColors={[]}
        // width="300px"
      />
    </div>
  );
};

export default ColorPicker;
