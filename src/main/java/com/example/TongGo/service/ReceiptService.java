package com.example.TongGo.service;

import com.example.TongGo.model.orderItemsModel;
import com.example.TongGo.model.orderModel;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptService {

    public byte[] generateReceiptPdf(orderModel order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);

            // Title
            Paragraph title = new Paragraph("BUKTI PEMBAYARAN TONGGO", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Order Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(10);
            infoTable.setSpacingAfter(20);

            infoTable.addCell(createCell("Nomor Pesanan:", boldFont, false));
            infoTable.addCell(createCell(order.getOrderNumber(), normalFont, false));
            infoTable.addCell(createCell("Tanggal:", boldFont, false));
            infoTable.addCell(createCell(order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm")), normalFont, false));
            infoTable.addCell(createCell("Nama Pelanggan:", boldFont, false));
            infoTable.addCell(createCell(order.getUserId() != null ? order.getUserId().getUsername() : "Guest", normalFont, false));
            infoTable.addCell(createCell("Nomor Meja:", boldFont, false));
            infoTable.addCell(createCell(order.getTableId() != null ? order.getTableId().getTableNumber().toString() : "-", normalFont, false));
            infoTable.addCell(createCell("Status:", boldFont, false));
            infoTable.addCell(createCell("BERHASIL / LUNAS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(0, 150, 0)), false));

            document.add(infoTable);

            // Items Table
            PdfPTable itemsTable = new PdfPTable(new float[]{3, 1, 1, 1});
            itemsTable.setWidthPercentage(100);
            itemsTable.setSpacingBefore(10);

            // Header
            itemsTable.addCell(createHeaderCell("Nama Barang", headerFont));
            itemsTable.addCell(createHeaderCell("Harga", headerFont));
            itemsTable.addCell(createHeaderCell("Jumlah", headerFont));
            itemsTable.addCell(createHeaderCell("Subtotal", headerFont));

            // Data
            if (order.getItems() != null) {
                for (orderItemsModel item : order.getItems()) {
                    itemsTable.addCell(createCell(item.getProductId() != null ? item.getProductId().getName() : "Produk", normalFont, true));
                    itemsTable.addCell(createCell(formatCurrency(item.getProductId() != null ? item.getProductId().getPrice() : 0.0), normalFont, true));
                    itemsTable.addCell(createCell(item.getQuantity().toString(), normalFont, true));
                    itemsTable.addCell(createCell(formatCurrency(item.getSubtotal()), normalFont, true));
                }
            }

            // Total
            PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL PEMBAYARAN", boldFont));
            totalLabelCell.setColspan(3);
            totalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabelCell.setPadding(8);
            itemsTable.addCell(totalLabelCell);

            PdfPCell totalValCell = new PdfPCell(new Phrase(formatCurrency(order.getTotalPrice()), boldFont));
            totalValCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            totalValCell.setPadding(8);
            itemsTable.addCell(totalValCell);

            document.add(itemsTable);

            // Footer
            Paragraph footer = new Paragraph("\n\nTerima kasih telah berbelanja di TongGo!\nPembayaran aman diproses oleh Midtrans.", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private PdfPCell createCell(String text, Font font, boolean border) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        if (!border) {
            cell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        }
        return cell;
    }

    private PdfPCell createHeaderCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(63, 81, 181)); // Material Blue
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        return cell;
    }

    private String formatCurrency(Double amount) {
        return String.format("Rp %,.0f", amount != null ? amount : 0).replace(',', '.');
    }
}
