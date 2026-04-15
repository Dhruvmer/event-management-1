const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

class BookingPDFGenerator {
  constructor(booking) {
    this.booking = booking;
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Booking Confirmation - ${booking.bookingId}`,
        Author: 'EventPro Management System',
        Subject: 'Booking Confirmation',
        Creator: 'EventPro'
      }
    });
  }

  generateHeader() {
    this.doc
      .fontSize(28)
      .fillColor('#6C63FF')
      .text('EventPro', 50, 45)
      .fontSize(10)
      .fillColor('#666666')
      .text('Professional Event Management', 50, 80)
      .moveDown();

    // Line separator
    this.doc
      .strokeColor('#6C63FF')
      .lineWidth(2)
      .moveTo(50, 100)
      .lineTo(545, 100)
      .stroke();

    // Confirmation Badge
    this.doc
      .fontSize(20)
      .fillColor('#28a745')
      .text('✓ BOOKING CONFIRMED', 50, 120, { align: 'center' })
      .moveDown();
  }

  generateBookingInfo() {
    const b = this.booking;
    const y = 160;

    this.doc
      .fontSize(14)
      .fillColor('#333333')
      .text('Booking Details', 50, y)
      .moveDown(0.5);

    // Booking ID Box
    this.doc
      .rect(50, y + 25, 495, 35)
      .fillAndStroke('#f8f9fa', '#dee2e6');

    this.doc
      .fontSize(12)
      .fillColor('#6C63FF')
      .text(`Booking ID: ${b.bookingId}`, 60, y + 35)
      .fillColor('#666')
      .text(`Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 350, y + 35);

    return y + 75;
  }

  generateEventDetails(startY) {
    const b = this.booking;
    let y = startY;

    this.doc
      .fontSize(14)
      .fillColor('#333333')
      .text('Event Information', 50, y)
      .moveDown(0.3);

    y += 25;

    const details = [
      ['Event Type', b.event?.title || b.event?.category || 'N/A'],
      ['Event Category', (b.event?.category || 'N/A').charAt(0).toUpperCase() + (b.event?.category || '').slice(1)],
      ['Event Date', new Date(b.eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' })],
      ['Event Time', b.eventTime],
      ['Number of Guests', b.guestCount.toString()],
      ['Venue', b.venueName || 'To be confirmed'],
      ['Venue Address', b.venueAddress || 'To be confirmed'],
      ['Package Selected', b.selectedPackage?.name || 'N/A']
    ];

    details.forEach(([label, value], index) => {
      const rowY = y + (index * 22);
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';

      this.doc
        .rect(50, rowY, 495, 22)
        .fill(bgColor);

      this.doc
        .fontSize(10)
        .fillColor('#666666')
        .text(label, 60, rowY + 6)
        .fillColor('#333333')
        .text(value, 250, rowY + 6);
    });

    return y + (details.length * 22) + 15;
  }

  generateContactDetails(startY) {
    const b = this.booking;
    let y = startY;

    this.doc
      .fontSize(14)
      .fillColor('#333333')
      .text('Contact Information', 50, y)
      .moveDown(0.3);

    y += 25;

    const contacts = [
      ['Contact Name', b.contactName],
      ['Email', b.contactEmail],
      ['Phone', b.contactPhone]
    ];

    contacts.forEach(([label, value], index) => {
      const rowY = y + (index * 22);
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';

      this.doc.rect(50, rowY, 495, 22).fill(bgColor);
      this.doc
        .fontSize(10)
        .fillColor('#666666').text(label, 60, rowY + 6)
        .fillColor('#333333').text(value, 250, rowY + 6);
    });

    return y + (contacts.length * 22) + 15;
  }

  generatePaymentDetails(startY) {
    const b = this.booking;
    let y = startY;

    this.doc
      .fontSize(14)
      .fillColor('#333333')
      .text('Payment Summary', 50, y);

    y += 25;

    // Payment box
    this.doc
      .rect(50, y, 495, 120)
      .fillAndStroke('#f0f0ff', '#6C63FF');

    this.doc
      .fontSize(11)
      .fillColor('#333333')
      .text('Package Price:', 70, y + 15)
      .text(`₹${(b.selectedPackage?.price || 0).toLocaleString('en-IN')}`, 400, y + 15, { align: 'right', width: 130 });

    if (b.additionalServices && b.additionalServices.length > 0) {
      let serviceY = y + 35;
      b.additionalServices.forEach(service => {
        this.doc
          .fontSize(10)
          .fillColor('#666')
          .text(`+ ${service.name}:`, 70, serviceY)
          .text(`₹${service.price.toLocaleString('en-IN')}`, 400, serviceY, { align: 'right', width: 130 });
        serviceY += 18;
      });
    }

    this.doc
      .fontSize(10)
      .fillColor('#666')
      .text('Subtotal:', 70, y + 55)
      .text(`₹${(b.subtotal || 0).toLocaleString('en-IN')}`, 400, y + 55, { align: 'right', width: 130 })
      .text('GST (18%):', 70, y + 72)
      .text(`₹${(b.tax || 0).toLocaleString('en-IN')}`, 400, y + 72, { align: 'right', width: 130 });

    if (b.discount > 0) {
      this.doc
        .fillColor('#28a745')
        .text('Discount:', 70, y + 89)
        .text(`-₹${b.discount.toLocaleString('en-IN')}`, 400, y + 89, { align: 'right', width: 130 });
    }

    // Total
    this.doc
      .moveTo(70, y + 95)
      .lineTo(530, y + 95)
      .stroke('#6C63FF');

    this.doc
      .fontSize(14)
      .fillColor('#6C63FF')
      .text('Total Amount:', 70, y + 100)
      .text(`₹${(b.totalAmount || 0).toLocaleString('en-IN')}`, 380, y + 100, { align: 'right', width: 150 });

    return y + 135;
  }

  generateFooter() {
    const pageHeight = this.doc.page.height;

    this.doc
      .strokeColor('#6C63FF')
      .lineWidth(1)
      .moveTo(50, pageHeight - 80)
      .lineTo(545, pageHeight - 80)
      .stroke();

    this.doc
      .fontSize(8)
      .fillColor('#999999')
      .text('This is a computer-generated document. No signature is required.', 50, pageHeight - 70, { align: 'center' })
      .text('© EventPro Management System | Contact: support@eventpro.com | Terms & Conditions Apply', 50, pageHeight - 55, { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, pageHeight - 40, { align: 'center' });
  }

  async generate() {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `booking-${this.booking.bookingId}.pdf`;
        const filePath = path.join(__dirname, '..', 'public', 'uploads', 'bookings', fileName);

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);

        this.doc.pipe(stream);

        this.generateHeader();
        let y = this.generateBookingInfo();
        y = this.generateEventDetails(y);
        y = this.generateContactDetails(y);

        // Check if we need a new page
        if (y > 550) {
          this.doc.addPage();
          y = 50;
        }

        this.generatePaymentDetails(y);
        this.generateFooter();

        this.doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath: `/uploads/bookings/${fileName}`,
            absolutePath: filePath
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = BookingPDFGenerator;
