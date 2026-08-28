<div align="center">
  <br />
  <img src="public/logo.png" alt="InkWise Logo" width="300" />
  <br />
  <br />
  <p>
    <b>Make your pages truly white.</b><br />
    Clean AI-generated notes, scanned pages, and document images for ink-friendly printing.
  </p>
</div>

---

## 💡 About InkWise

InkWise is a privacy-first, batch image cleaning and print optimization tool. 

AI-generated notes and scanned documents often appear to have a white paper background, but the actual pixels are frequently near-white gray values. When printed in black and white, printers waste toner and ink to reproduce these slightly gray backgrounds. InkWise solves this by normalizing near-white backgrounds into true RGB(255,255,255) while preserving handwriting, text, diagrams, and anti-aliased edges.

## ✨ Features

- **🛡️ Privacy First (Local Processing):** All image processing happens directly in your browser using Web Workers. No images are ever uploaded to a server.
- **⚡ Fast Batch Cleaning:** Upload and process dozens of high-resolution images simultaneously with multi-threaded Web Worker architecture.
- **🎯 Print Optimization:** Convert to grayscale, increase text contrast, and flatten transparencies with a single click.
- **🖱️ Drag & Drop Ordering:** Easily reorder your pages exactly how you want them before downloading.
- **📦 Bulk Export:** Download all cleaned images in a single, neatly organized ZIP file.
- **🎨 Premium UI:** A beautiful, minimalistic, iLovePDF-style interface focused on getting the job done without distractions.

## 🛠️ Technology Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Context API
- **Image Processing:** Browser Canvas API + Web Workers (`ImageData` transfer)
- **Drag and Drop:** [`@dnd-kit`](https://dndkit.com/)

## 🚀 Getting Started

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/MohammedShakib/InkWise.git
cd InkWise
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## 📁 Architecture Overview

- `src/lib/image-processing/`: Contains the core image manipulation logic.
  - `worker-client.ts`: Manages a pool of Web Workers to handle concurrent image processing.
  - `levels.ts`: Applies Look-Up Tables (LUTs) to adjust white point, black point, and gamma.
  - `grayscale.ts`: Efficiently converts color images to optimized grayscale for printing.
- `src/components/inkwise/`: Contains the modular UI components (`DocumentGrid`, `SettingsPanel`, `UploadDropzone`).
- `src/lib/store/InkWiseContext.tsx`: The central state management for the application.

## 📝 License

This project is licensed under the MIT License.
