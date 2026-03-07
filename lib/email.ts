// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  productName: string
  quantity: number
  price: number
}

export async function sendOrderEmail(
  orderId: number,
  total: number,
  items: OrderItem[],
  customerName: string,
  customerEmail?: string,
  slipUrl?: string | null
) {
  if (!process.env.RESEND_API_KEY) return // ถ้าไม่มี API Key ให้ข้ามไป

  // ส่งหาใครบ้าง? (ถ้าระบุ STORE_EMAIL ใน .env ก็ส่งให้ร้านด้วย)
  const storeEmail = process.env.STORE_EMAIL
  const recipients: string[] = []

  // ถ้าต้องการส่งให้ทั้งร้านและลูกค้า (ถ้าลูกค้ากรอกอีเมล)
  if (storeEmail) recipients.push(storeEmail)
  if (customerEmail) recipients.push(customerEmail)

  if (recipients.length === 0) return // ไม่มีผู้รับ

  const itemsHtml = items.map(
    (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString()} ฿</td>
      </tr>
    `
  ).join('')

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #ea580c; text-align: center;">🧾 ยืนยันคำสั่งซื้อใหม่ #${orderId}</h2>
      <p>สวัสดีคุณ <strong>${customerName}</strong></p>
      <p>เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว รายละเอียดมีดังนี้:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f9fafb; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #ddd;">รายการสินค้า</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">จำนวน</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">ราคา</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">ยอดชำระสุทธิ:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #ea580c; font-size: 18px;">${total.toLocaleString()} ฿</td>
          </tr>
        </tfoot>
      </table>

      ${slipUrl ? `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #6b7280; font-size: 14px;">คุณได้แนบหลักฐานการโอนเงินมาแล้ว (รอแอดมินตรวจสอบ)</p>
          <a href="${slipUrl}" style="display: inline-block; background: #ea580c; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ดูสลิปโอนเงิน
          </a>
        </div>
      ` : `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #b45309; font-weight: bold;">กรุณาชำระเงินและแนบสลิปผ่านทางหน้าเว็บไซต์ของคุณ</p>
        </div>
      `}
      
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px;">
        ขอบคุณที่อุดหนุน U-ra Seafood! 🦐
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: 'FoodShop <onboarding@resend.dev>', // ใช้อีเมลเริ่มต้นของ Resend สำหรับทดสอบ
      to: recipients,
      subject: `[FoodShop] ยืนยันคำสั่งซื้อ #${orderId} - ${customerName}`,
      html: htmlContent,
    })
    console.log('[Email] Notification sent successfully')
  } catch (error) {
    console.error('[Email] Failed to send notification', error)
  }
}
