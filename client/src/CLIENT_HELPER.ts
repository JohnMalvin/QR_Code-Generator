export const setBackgroundColor = (color: string) => {
	sessionStorage.setItem("BackGroundColor", color);
}
export const setFillColor = (color: string) => {
	sessionStorage.setItem("FillColor", color);
}
export const getBackgroundColor = (): string => {
	let result = sessionStorage.getItem("BackgroundColor");
	if (!result) result = "#FFF" 
	return result;
}
export const getFillColor = (): string => {
	let result = sessionStorage.getItem("FillColor");
	if (!result) result = "#000" 
	return result;
}

export const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
};
 export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch  (error) {
	console.error("Invalid URL:", error);
    return false;
  }
};