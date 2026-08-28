import cv2
import numpy as np
from PIL import Image

# Read image
img_path = r"d:\projects\InkWise\public\logo and icon.png"
img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)

# Extract alpha channel
alpha = img[:, :, 3]

# Threshold to get mask of non-transparent pixels
_, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Sort contours by area, descending
contours = sorted(contours, key=cv2.contourArea, reverse=True)

# Assuming the top 2 largest contours are the logo text and the icon
# We get their bounding boxes
boxes = [cv2.boundingRect(c) for c in contours[:2]]

# Sort boxes from left to right to figure out which is icon and which is text
# Or we can sort by width/height ratio: Icon is usually square (ratio ~1), text is wide (ratio > 2)
pil_img = Image.open(img_path)

for i, (x, y, w, h) in enumerate(boxes):
    cropped = pil_img.crop((x, y, x+w, y+h))
    ratio = w / h
    
    # Text is usually wider
    if ratio > 1.5:
        cropped.save(r"d:\projects\InkWise\public\logo.png")
        print(f"Saved logo.png (width: {w}, height: {h})")
    else:
        cropped.save(r"d:\projects\InkWise\public\icon.png")
        print(f"Saved icon.png (width: {w}, height: {h})")
