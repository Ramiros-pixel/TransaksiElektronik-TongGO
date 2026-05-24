import os
import cv2
import numpy as np
import pytesseract
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime

# =====================================
# PATH TESSERACT
# =====================================
possible_tesseract_paths = [
    os.environ.get('TESSERACT_PATH'),
    r'C:\TEtesseract\tesseract.exe',
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files\Tesseract-OCR',
    r'C:\Program Files (x86)\Tesseract-OCR'
]
possible_tesseract_paths = [p for p in possible_tesseract_paths if p]
found_tesseract = None

import shutil
if shutil.which('tesseract'):
    found_tesseract = shutil.which('tesseract')
else:
    for path in possible_tesseract_paths:
        exe_path = os.path.join(path, 'tesseract.exe') if os.path.isdir(path) else path
        if os.path.exists(exe_path):
            found_tesseract = exe_path
            break

if found_tesseract:
    print(f"Menemukan tesseract: {found_tesseract}")
    pytesseract.pytesseract.tesseract_cmd = found_tesseract
else:
    print("Tesseract tidak ditemukan.")
    print("1. Pastikan Tesseract OCR sudah diinstal.")
    print("2. Tambahkan folder instalasi Tesseract ke PATH sistem.")
    print("3. Atau set environment variable TESSERACT_PATH ke lokasi tesseract.exe.")
    print("Contoh path default Windows:")
    print(" - C:\\Program Files\\Tesseract-OCR\\tesseract.exe")
    print(" - C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe")
    exit()

# =====================================
# LOAD TEMPLATE UANG ASLI
# =====================================
script_dir = os.path.dirname(os.path.abspath(__file__))
template_files = [
    ("100 RIBU", os.path.join(script_dir, 'uang_100.png')),
    ("50 RIBU", os.path.join(script_dir, 'uang_50.png')),
]

template_rois = {}
for label, template_path in template_files:
    if os.path.exists(template_path):
        img = cv2.imread(template_path)
        if img is not None:
            template = cv2.resize(img, (800, 400))
            gray_template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
            x = 450
            y = 250
            w = 250
            h = 60
            template_rois[label] = gray_template[y:y+h, x:x+w]

if not template_rois:
    print("Template tidak ditemukan. Pastikan salah satu file ini ada di folder skrip:")
    print(" - uang_100.png")
    print(" - uang_50.png")
    exit()

print("Template tersedia:")
for label in template_rois:
    print(f" - {label}")

# =====================================
# ROI FRAME
# =====================================
x = 450
y = 250
w = 250
h = 60

# =====================================
# BUKA KAMERA
# =====================================
cam = cv2.VideoCapture(0)

if not cam.isOpened():
    print("Kamera tidak bisa dibuka")
    exit()

print("Tekan:")
print("S = scan uang")
print("Q = keluar")

while True:

    ret, frame = cam.read()

    if not ret:
        print("Frame gagal dibaca")
        break

    # resize frame kamera
    frame = cv2.resize(frame, (800, 400))

    # tampilkan ROI
    cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)

    cv2.putText(
        frame,
        "Arahkan uang lalu tekan S",
        (20,40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0,255,0),
        2
    )

    cv2.imshow("Deteksi Uang", frame)

    key = cv2.waitKey(1)

    # =====================================
    # TEKAN S UNTUK SCAN
    # =====================================
    if key == ord('s'):

        gray_test = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        roi_test = gray_test[y:y+h, x:x+w]
        cv2.imshow("ROI Uji", roi_test)

        # =====================================
        # TEMPLATE MATCHING
        # =====================================
        similarity_results = {}
        for label, roi_template in template_rois.items():
            result = cv2.matchTemplate(
                roi_test,
                roi_template,
                cv2.TM_CCOEFF_NORMED
            )
            _, similarity, _, _ = cv2.minMaxLoc(result)
            similarity_results[label] = similarity

        best_label = max(similarity_results, key=similarity_results.get)
        best_similarity = similarity_results[best_label]

        # =====================================
        # OCR
        # =====================================
        text_test = pytesseract.image_to_string(roi_test).strip()

        # =====================================
        # VALIDASI
        # =====================================
        # Menaikkan threshold agar lebih ketat/peka terhadap perbedaan gambar
        SIMILARITY_THRESHOLD = 0.78
        # Memperbaiki bug: default seharusnya palsu/tidak dikenali
        status = "INDIKASI UANG PALSU"
        
        # Syarat: kemiripan tinggi dan OCR mendeteksi setidaknya beberapa karakter (lebih dari 2)
        if best_similarity >= SIMILARITY_THRESHOLD and len(text_test) > 2:
            status = f"INDIKASI ASLI ({best_label})"

        # =====================================
        # HASIL
        # =====================================
        print("\n===== HASIL DETEKSI =====")
        for label, similarity in similarity_results.items():
            print(f"Similarity {label} : {similarity:.2f}")
        print(f"OCR Test     : {text_test}")
        print(f"Status       : {status}")

        # =====================================
        # SIMPAN GAMBAR
        # =====================================
        cv2.imwrite("hasil_scan.jpg", frame)

        # =====================================
        # BUAT PDF
        # =====================================
        pdf = canvas.Canvas(
            "hasil_deteksi.pdf",
            pagesize=letter
        )

        width, height = letter

        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawCentredString(width / 2, 760, "LAPORAN DETEKSI UANG")
        pdf.setLineWidth(1)
        pdf.line(50, 752, width - 50, 752)

        pdf.setFont("Helvetica", 11)
        pdf.drawString(50, 730, f"Tanggal       : {datetime.now().strftime('%d %B %Y %H:%M:%S')}")
        pdf.drawString(50, 710, f"Hasil Utama   : {status}")
        pdf.drawString(50, 690, f"Similarity    : {best_similarity:.2f}")
        pdf.drawString(50, 670, f"Best Label    : {best_label}")

        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(50, 640, "Detail Similarity:")

        pdf.setFont("Helvetica", 11)
        y_line = 620
        for label, similarity in similarity_results.items():
            pdf.drawString(60, y_line, f"- {label} : {similarity:.2f}")
            y_line -= 18

        y_line -= 4
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(50, y_line, "Hasil OCR:")

        pdf.setFont("Helvetica", 11)
        y_line -= 20
        text_obj = pdf.beginText(50, y_line)
        text_obj.setLeading(14)
        text_obj.textLines(text_test if text_test else "(Tidak ada teks terdeteksi)")
        pdf.drawText(text_obj)

        note = "Uang memiliki indikasi asli berdasarkan ROI dan OCR." if status.startswith("INDIKASI ASLI") else "Uang memiliki indikasi palsu."
        y_note = text_obj.getY() - 24
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y_note, "Kesimpulan:")
        pdf.setFont("Helvetica", 11)
        pdf.drawString(50, y_note - 18, note)

        try:
            pdf.drawImage(
                "hasil_scan.jpg",
                340,
                520,
                width=220,
                height=130,
                preserveAspectRatio=True,
                anchor='c'
            )
            pdf.setFont("Helvetica", 9)
            pdf.drawCentredString(450, 510, "Gambar hasil scan")
        except Exception:
            pass

        pdf.save()

        print("PDF berhasil dibuat!")

# TEKAN Q UNTUK KELUAR
    
    elif key == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()