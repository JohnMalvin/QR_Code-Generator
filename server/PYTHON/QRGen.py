import sys
import json
import qrcode  # type: ignore
from PIL import Image  # type: ignore
import requests  # type: ignore
from io import BytesIO
import os 


if len(sys.argv) > 1:
    data = json.loads(sys.argv[1])

    url = data["URL"]
    backgroundColor = eval(data["backgroundColor"])
    fillColor = eval(data["fillColor"])
    logo_url = data.get("logoURL")
    
    withLogo = bool(logo_url)

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
        response = requests.get(logo_url)
        if response.status_code != 200:
            print(f" Failed to download image. Status code: {response.status_code}")
            exit()

        logo = Image.open(BytesIO(response.content))
        logo_size = int(qr_width * 0.2)
        logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
        pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
        qr_img.paste(logo, pos, mask=logo if logo.mode == 'RGBA' else None)

    output_dir = "RESULT"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_path = os.path.join(output_dir, "qr_with_logo_from_url.png")
    qr_img.save(output_path)

    print(f" QR code with logo saved as: {output_path}")
else:
    print("No data received.")
