import sys
import json
import qrcode  # type: ignore
from PIL import Image  # type: ignore
from io import BytesIO
import os
import base64  # Needed to decode base64

print("Python script started.")
if len(sys.argv) > 1:
    print(f"Data received in Python: {sys.argv[1]}")
    try:
        data = json.loads(sys.argv[1])
        print(f"Parsed data: {data}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        sys.exit(1)

    url = data["URL"]
    backgroundColor = eval(data["backgroundColor"])
    fillColor = eval(data["fillColor"])
    
    logo_file_base64 = data.get("logoFile")

    withLogo = bool(logo_file_base64)

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=fillColor, back_color=backgroundColor).convert("RGB")

    qr_width, qr_height = qr_img.size

    if withLogo:
        # Decode the base64-encoded logo file
        logo_file = base64.b64decode(logo_file_base64)  # Decode base64 string back to bytes
        logo = Image.open(BytesIO(logo_file)).convert("RGBA")

        logo_size = int(qr_width * 0.19)
        logo = logo.resize((logo_size, logo_size), Image.LANCZOS)

        # Step 1: Create a background box same size as logo
        background_box = Image.new("RGB", (logo_size, logo_size), backgroundColor)

        # Step 2: Paste the background box in the center
        pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
        qr_img.paste(background_box, pos)

        # Step 3: Paste logo on top (preserve transparency if any)
        qr_img.paste(logo, pos, mask=logo if logo.mode == 'RGBA' else None)

    output_dir = "RESULT"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_path = os.path.join(output_dir, "qr_with_logo_from_buffer.png")
    qr_img.save(output_path)

    print(f"QR code with logo saved as: {output_path}")
else:
    print("No data received.")
