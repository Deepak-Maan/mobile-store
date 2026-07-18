import os
from PIL import Image

mapping = {
    r"C:\Users\pmor1\.gemini\antigravity\brain\d74cb493-6d14-45db-94a6-c5b48b19a725\iphone_15_pro_front_1784386028329.png": r"C:\Users\pmor1\Desktop\mobile-store-react\public\images\iphone_15_pro.png",
    r"C:\Users\pmor1\.gemini\antigravity\brain\d74cb493-6d14-45db-94a6-c5b48b19a725\galaxy_s24_ultra_front_1784386042381.png": r"C:\Users\pmor1\Desktop\mobile-store-react\public\images\galaxy_s24_ultra.png",
    r"C:\Users\pmor1\.gemini\antigravity\brain\d74cb493-6d14-45db-94a6-c5b48b19a725\pixel_8_pro_front_1784386057197.png": r"C:\Users\pmor1\Desktop\mobile-store-react\public\images\pixel_8_pro.png",
    r"C:\Users\pmor1\.gemini\antigravity\brain\d74cb493-6d14-45db-94a6-c5b48b19a725\oneplus_12_front_1784386071543.png": r"C:\Users\pmor1\Desktop\mobile-store-react\public\images\oneplus_12.png",
    r"C:\Users\pmor1\.gemini\antigravity\brain\d74cb493-6d14-45db-94a6-c5b48b19a725\xiaomi_14_ultra_front_1784386086677.png": r"C:\Users\pmor1\Desktop\mobile-store-react\public\images\xiaomi_14_ultra.png",
}

for src, dst in mapping.items():
    if not os.path.exists(src):
        print(f"File not found: {src}")
        continue
    
    img = Image.open(src).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Black key: if pixel is close to black, make it transparent
        max_val = max(r, g, b)
        if max_val < 30:
            if max_val <= 6:
                new_data.append((0, 0, 0, 0)) # Fully transparent
            else:
                # Interpolate transparency
                alpha = int((max_val - 6) / (30 - 6) * 255)
                new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    
    # Crop the image to its non-transparent content boundary
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, "PNG")
    print(f"Processed and saved: {dst}")
