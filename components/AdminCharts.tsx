'use client'

import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from 'recharts'

interface DailySale {
    date: string
    revenue: number
    orders: number
}

interface TopProduct {
    name: string
    totalSold: number
    revenue: number
}

const COLORS = ['#f97316', '#ea580c', '#fb923c', '#fbbf24', '#f59e0b']

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
}

export function AdminCharts() {
    const [dailySales, setDailySales] = useState<DailySale[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(data => {
                setDailySales(data.dailySales ?? [])
                setTopProducts(data.topProducts ?? [])
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>กำลังโหลดข้อมูลกราฟ...</p>
            </div>
        )
    }

    if (dailySales.length === 0 && topProducts.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>ยังไม่มีข้อมูลยอดขาย</p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Line Chart — ยอดขายรายวัน */}
            {dailySales.length > 0 && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#1f2937', marginBottom: '20px' }}>
                        📈 ยอดขายรายวัน (7 วันล่าสุด)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={dailySales} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(val: unknown) => [`${Number(val).toLocaleString()} ฿`, 'ยอดขาย']}
                                labelFormatter={(label: unknown) => `วันที่ ${formatDate(String(label))}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: '13px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#f97316"
                                strokeWidth={3}
                                dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                                activeDot={{ r: 7, fill: '#ea580c' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Bar Chart — Top 5 สินค้า */}
            {topProducts.length > 0 && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#1f2937', marginBottom: '20px' }}>
                        🏆 Top {topProducts.length} สินค้าขายดี
                    </h3>
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={120}
                                tick={{ fontSize: 12, fill: '#374151' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(val: unknown) => [`${Number(val)} ชิ้น`, 'จำนวนที่ขาย']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: '13px' }}
                            />
                            <Bar dataKey="totalSold" radius={[0, 8, 8, 0]}>
                                {topProducts.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
