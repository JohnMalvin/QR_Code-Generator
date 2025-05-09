import sys
import json
import qrcode
from PIL import Image
import os
import uuid

if len(sys.argv) <= 1:
    sys.exit(1)

try:
    data = json.loads(sys.argv[1])
except json.JSONDecodeError:
    sys.exit(1)

url = data.get("URL")
backgroundColor = eval(data.get("backgroundColor", "[255, 255, 255]"))
fillColor = eval(data.get("fillColor", "[0, 0, 0]"))
logo_file_path = data.get("logoFile")

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

if logo_file_path:
    try:
        logo = Image.open(logo_file_path)
        logo = logo.convert("RGBA")
        logo_width, logo_height = logo.size
        max_logo_size = int(qr_width * 0.19)
        scale_factor = min(max_logo_size / logo_width, max_logo_size / logo_height)

        new_width = int(logo_width * scale_factor)
        new_height = int(logo_height * scale_factor)
        logo = logo.resize((new_width, new_height), Image.LANCZOS)

        background_box = Image.new("RGB", (max_logo_size, max_logo_size), tuple(backgroundColor))
        pos = ((qr_width - max_logo_size) // 2, (qr_height - max_logo_size) // 2)
        qr_img.paste(background_box, pos)

        logo_pos = ((max_logo_size - new_width) // 2, (max_logo_size - new_height) // 2)

        if logo.mode in ("RGBA", "LA"):
            qr_img.paste(logo, (pos[0] + logo_pos[0], pos[1] + logo_pos[1]), mask=logo.split()[-1])
        else:
            qr_img.paste(logo, (pos[0] + logo_pos[0], pos[1] + logo_pos[1]))
    except Exception:
        pass
    finally:
        if (
            logo_file_path
            and os.path.exists(logo_file_path)
            and os.path.isfile(logo_file_path)
            # and str(logo_file_path).lower() != r"c:\codes\github\qr_code-generator\server\uploads".lower()
        ):
            os.remove(logo_file_path)

script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.abspath(os.path.join(script_dir, '../../RESULT'))

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

filename = f"qr_with_logo_{uuid.uuid4().hex}.png"
output_path = os.path.join(output_dir, filename)

qr_img.save(output_path)

print(json.dumps({'resultPath': f'/RESULT/{filename}'}))
