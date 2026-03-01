// lib/discord.ts

interface OrderItem {
    productName: string
    quantity: number
    price: number
}

export async function notifyDiscord(
    orderId: number,
    total: number,
    items: OrderItem[],
    customerName?: string
): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) return // ถ้าไม่ตั้งค่า → ข้ามไป

    const itemLines = items.map(
        (i) => `> • **${i.productName}** × ${i.quantity} — ${(i.price * i.quantity).toLocaleString()} ฿`
    ).join('\n')

    const embed = {
        username: '🍤 FoodShop',
        embeds: [
            {
                title: `🛒 ออเดอร์ใหม่ #${orderId}`,
                color: 0xf97316, // Orange
                fields: [
                    {
                        name: '👤 ลูกค้า',
                        value: customerName ?? 'ไม่ระบุ',
                        inline: true,
                    },
                    {
                        name: '💰 ยอดรวม',
                        value: `**${total.toLocaleString()} ฿**`,
                        inline: true,
                    },
                    {
                        name: '📦 รายการสินค้า',
                        value: itemLines || 'ไม่มีรายการ',
                    },
                ],
                footer: {
                    text: 'FoodShop Notification',
                },
                timestamp: new Date().toISOString(),
            },
        ],
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed),
        })
    } catch {
        // ไม่ให้ Discord error ทำให้ order ล้มเหลว
        console.error('[Discord] Failed to send notification')
    }
}
