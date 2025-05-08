import sys
import json
import qrcode  # type: ignore
from PIL import Image  # type: ignore
import os
import uuid  # New import for generating unique filenames

# Debugging the script's start
print("Python script started.")  # Debug log for script start

# Check for incoming data
if len(sys.argv) <= 1:
    print("No data received.")  # Debug log if no data is received
    sys.exit(1)

try:
    print(f"Raw data received: {sys.argv[1]}")  # Debug log for raw data received
    data = json.loads(sys.argv[1])
    print(f"Parsed JSON: {data}")  # Debug log after successful JSON parsing
except json.JSONDecodeError as e:
    print(f"JSON decoding failed: {e}")  # Debug log for JSON decoding failure
    sys.exit(1)

# Extract fields from data
url = data.get("URL")
backgroundColor = eval(data.get("backgroundColor", "[255, 255, 255]"))
fillColor = eval(data.get("fillColor", "[0, 0, 0]"))
logo_file_path = data.get("logoFile")

# Debugging the extracted data
print(f"URL: {url}")
print(f"Background Color: {backgroundColor}")
print(f"Fill Color: {fillColor}")
print(f"Logo File Path: {logo_file_path}")

# Initialize QR code
qr = qrcode.QRCode(
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

qr.add_data(url)
qr.make(fit=True)

# Create QR code image
qr_img = qr.make_image(
    fill_color=tuple(fillColor),
    back_color=tuple(backgroundColor)
).convert("RGB")

qr_width, qr_height = qr_img.size
print(f"QR code size: {qr_width}x{qr_height}")  # Debug log for QR code size

# Process logo if path is provided
if logo_file_path:
    try:
        print(f"Attempting to open logo file from path: {logo_file_path}")  # Debug log before opening logo file
        logo = Image.open(logo_file_path)
        print(f"Logo loaded successfully. Mode: {logo.mode}")  # Debug log after loading logo

        # Maintain aspect ratio and resize logo to fit within the fixed square size
        logo = logo.convert("RGBA")
        logo_width, logo_height = logo.size

        # Set the size of the square (0.2 of the QR code size)
        max_logo_size = int(qr_width * 0.18)

        # Calculate the scaling factor while maintaining the aspect ratio
        scale_factor = min(max_logo_size / logo_width, max_logo_size / logo_height)
        print(f"Scale factor for logo: {scale_factor}")  # Debug log for scale factor

        # Calculate the new dimensions for the logo
        new_width = int(logo_width * scale_factor)
        new_height = int(logo_height * scale_factor)

        # Resize the logo while maintaining aspect ratio
        logo = logo.resize((new_width, new_height), Image.LANCZOS)
        print(f"Resized logo to: {new_width}x{new_height}")  # Debug log for resized logo

        # Create a square background box (same size as max_logo_size)
        background_box = Image.new("RGB", (max_logo_size, max_logo_size), tuple(backgroundColor))

        # Position for centering the logo in the square (inside the QR code)
        pos = ((qr_width - max_logo_size) // 2, (qr_height - max_logo_size) // 2)
        print(f"Pasting background box at position: {pos}")  # Debug log for background box position
        
        # Paste the background box onto the QR code
        qr_img.paste(background_box, pos)

        # Position the logo in the center of the background box
        logo_pos = ((max_logo_size - new_width) // 2, (max_logo_size - new_height) // 2)
        print(f"Pasting logo at position: {logo_pos}")  # Debug log for logo position
        
        # Paste the logo with correct alpha handling
        if logo.mode in ("RGBA", "LA"):
            qr_img.paste(logo, (pos[0] + logo_pos[0], pos[1] + logo_pos[1]), mask=logo.split()[-1])  # Use alpha channel
            print("Logo pasted with alpha mask.")  # Debug log for pasting with alpha mask
        else:
            qr_img.paste(logo, (pos[0] + logo_pos[0], pos[1] + logo_pos[1]))
            print("Logo pasted without alpha mask.")  # Debug log for pasting without alpha mask
    except Exception as e:
        print(f"Error processing logo: {e}")  # Debug log for any logo processing error
else:
    print("No logo file path provided — skipping logo step.")  # Debug log for missing logo file

# Save the final QR code with a unique filename using UUID
script_dir = os.path.dirname(os.path.abspath(__file__))  # Get the current script's directory
output_dir = os.path.abspath(os.path.join(script_dir, '../../RESULT'))

# Create the RESULT directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    print(f"Created output directory: {output_dir}")  # Debug log

# Generate a unique filename using UUID to avoid overwriting
filename = f"qr_with_logo_{uuid.uuid4().hex}.png"
output_path = os.path.join(output_dir, filename)
print(f"Saving QR code to: {output_path}")  # Debug log

qr_img.save(output_path)

# Send back the relative URL for the frontend to use
print(f"QR code saved at: {output_path}")  # Debug log
print(json.dumps({'resultPath': f'/RESULT/{filename}'}))  # Returning the unique result path
