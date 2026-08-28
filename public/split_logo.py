import cv2
import numpy as np
from PIL import Image

img_path = r"d:\projects\InkWise\public\logo and icon.png"
img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
alpha = img[:, :, 3]

_, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
clean_alpha = np.zeros_like(thresh)

for c in contours:
    if cv2.contourArea(c) > 50:
        cv2.drawContours(clean_alpha, [c], -1, 255, thickness=cv2.FILLED)

col_sum = np.sum(clean_alpha, axis=0)
non_empty_cols = np.where(col_sum > 0)[0]

gaps = np.diff(non_empty_cols)
max_gap_idx = np.argmax(gaps)
split_x = non_empty_cols[max_gap_idx] + gaps[max_gap_idx] // 2

left_alpha = clean_alpha[:, :split_x]
right_alpha = clean_alpha[:, split_x:]

left_rows = np.any(left_alpha > 0, axis=1)
left_cols = np.any(left_alpha > 0, axis=0)
ly_min, ly_max = np.where(left_rows)[0][[0, -1]]
lx_min, lx_max = np.where(left_cols)[0][[0, -1]]

right_rows = np.any(right_alpha > 0, axis=1)
right_cols = np.any(right_alpha > 0, axis=0)
ry_min, ry_max = np.where(right_rows)[0][[0, -1]]
rx_min, rx_max = np.where(right_cols)[0][[0, -1]]
rx_min += split_x
rx_max += split_x

pil_img = Image.open(img_path)

logo = pil_img.crop((lx_min, ly_min, lx_max+1, ly_max+1))
logo.save(r"d:\projects\InkWise\public\logo.png")
print(f"Saved logo.png (width: {logo.width}, height: {logo.height})")

icon = pil_img.crop((rx_min, ry_min, rx_max+1, ry_max+1))
icon.save(r"d:\projects\InkWise\public\icon.png")
print(f"Saved icon.png (width: {icon.width}, height: {icon.height})")
