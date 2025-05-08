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
if logo_file_path:
    try:
        print(f" Attempting to open logo file from path: {logo_file_path}")
        logo = Image.open(logo_file_path)
        print(f" Logo loaded successfully. Mode: {logo.mode}")

        logo = logo.convert("RGBA")
        logo_size = int(qr_width * 0.19)
        logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
        print(f" Resized logo to: {logo_size}x{logo_size}")

        # Create background box
        background_box = Image.new("RGB", (logo_size, logo_size), tuple(backgroundColor))
        pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)

        # Paste background box
        print(f" Pasting background box at position: {pos}")
        qr_img.paste(background_box, pos)

        # Paste logo with correct alpha handling
        print(" Pasting logo over background box...")
        if logo.mode in ("RGBA", "LA"):
            qr_img.paste(logo, pos, mask=logo.split()[-1])  # Use alpha channel
            print(" Logo pasted with alpha mask.")
        else:
            qr_img.paste(logo, pos)
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
