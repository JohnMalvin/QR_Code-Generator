import sys
import json
import qrcode  # type: ignore
from PIL import Image  # type: ignore
import os

print("Python script started.")

# Check for incoming data
if len(sys.argv) <= 1:
    print(" No data received.")
    sys.exit(1)

try:
    print(f"Raw data received: {sys.argv[1]}")
    data = json.loads(sys.argv[1])
    print(f" Parsed JSON: {data}")
except json.JSONDecodeError as e:
    print(f" JSON decoding failed: {e}")
    sys.exit(1)

# Extract fields from data
url = data.get("URL")
backgroundColor = eval(data.get("backgroundColor", "[255, 255, 255]"))
fillColor = eval(data.get("fillColor", "[0, 0, 0]"))
logo_file_path = data.get("logoFile")

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

qr_img = qr.make_image(
    fill_color=tuple(fillColor),
    back_color=tuple(backgroundColor)
).convert("RGB")

qr_width, qr_height = qr_img.size
print(f"QR code size: {qr_width}x{qr_height}")

# Process logo if path is provided
# Process logo if path is provided
if logo_file_path:
    try:
        print(f" Attempting to open logo file from path: {logo_file_path}")
        logo = Image.open(logo_file_path)
        print(f" Logo loaded successfully. Mode: {logo.mode}")

        # Maintain aspect ratio and resize logo to fit within the fixed square size
        logo = logo.convert("RGBA")
        logo_width, logo_height = logo.size

        # Set the size of the square (0.2 of the QR code size)
        max_logo_size = int(qr_width * 0.18)

        # Calculate the scaling factor while maintaining the aspect ratio
        scale_factor = min(max_logo_size / logo_width, max_logo_size / logo_height)

        # Calculate the new dimensions for the logo
        new_width = int(logo_width * scale_factor)
        new_height = int(logo_height * scale_factor)

        # Resize the logo while maintaining aspect ratio
        logo = logo.resize((new_width, new_height), Image.LANCZOS)
        print(f" Resized logo to: {new_width}x{new_height}")

        # Create a square background box (same size as max_logo_size)
        background_box = Image.new("RGB", (max_logo_size, max_logo_size), tuple(backgroundColor))

        # Position for centering the logo in the square (inside the QR code)
        pos = ((qr_width - max_logo_size) // 2, (qr_height - max_logo_size) // 2)
        print(f" Pasting background box at position: {pos}")
        
        # Paste the background box onto the QR code
        qr_img.paste(background_box, pos)

        # Position the logo in the center of the background box
        logo_pos = ((max_logo_size - new_width) // 2, (max_logo_size - new_height) // 2)
        print(f" Pasting logo at position: {logo_pos}")
        
        # Paste the logo with correct alpha handling
        if logo.mode in ("RGBA", "LA"):
            qr_img.paste(logo, (pos[0] + logo_pos[0], pos[1] + logo_pos[1]), mask=logo.split()[-1])  # Use alpha channel
            print(" Logo pasted with alpha mask.")
        else:
            qr_img.paste(logo, (pos[0] + logo_pos[0], pos[1] + logo_pos[1]))
            print(" Logo pasted without alpha mask.")
    except Exception as e:
        print(f" Error processing logo: {e}")


else:
    print(" No logo file path provided — skipping logo step.")

# Save the final QR code
output_dir = "RESULT"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    print(f" Created output directory: {output_dir}")

output_path = os.path.join(output_dir, "qr_with_logo.png")
qr_img.save(output_path)
print(f" QR code saved at: {output_path}")

print(" Python script completed successfully.")
