import qrcode # type: ignore
from PIL import Image # type: ignore
import requests # type: ignore
from io import BytesIO

data = {
    "URL": "https://www.google.com/",
    "backgroundColor" : "(255, 255, 255)",
    "fillColor" : "(0, 0, 0)",
    "logoURL": "https://upload.wikimedia.org/wikipedia/commons/2/25/Intel_logo_%282006-2020%29.jpg?20111021093434"
}

withLogo = False
if "logoURL" in data and data["logoURL"]:
    withLogo = True
    logo_url = data["logoURL"]

url = data["URL"]
backgroundColor = eval(data["backgroundColor"])
fillColor = eval(data["fillColor"])

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
        print(f"❌ Failed to download image. Status code: {response.status_code}")
        exit()

    logo = Image.open(BytesIO(response.content))
    logo_size = int(qr_width * 0.2)
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
    qr_img.paste(logo, pos, mask=logo if logo.mode == 'RGBA' else None)

output_path = "result/qr_with_logo_from_url.png"
qr_img.save(output_path)

print(f"✅ QR code with logo saved as: {output_path}")
