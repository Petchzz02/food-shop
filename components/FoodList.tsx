'use client'

import { useState } from "react"

interface Product {
    id : number;
    name : string;
    price : number;
}

export function FoodList ({ products } : { products : Product [] }) {
    // สร้าง state สำหรับเก็บข้อมูลตะกร้า
    const [cart, setCart] = useState<{ name: string; price: number; count: number}[]>([])
    
    // ฟังก์ชันเพิ่มสินค้าใส่ตะกร้า
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item)=> item.name === product.name)
        if (existing) {
            return prev.map ((item)=>
            item.name === product.name ? { ...item, count: item.count + 1 }: item
            )
        }
        return [...prev, { name: product.name, price: product.price, count: 1 }]
        }) 
    }

    // คำนวณราคารวมทั้งหมด
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.count, 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ฝั่งรายการเมนูอาหาร */}
            <div className="md:col-span-2 space-y-4"> 
            <h3 className="text-xl font-bold text-gray-800 mb-6">รายการเมนูอาหาร</h3>
            <div className="grid gap-4">
                {products.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            <p className="text-orange-600 font-bold">{item.price},.-</p>
                        </div>
                        <button
                        onClick={() => addToCart(item)}
                        className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                        >
                            เพิ่มใส่ตะกร้า
                        </button>
                    </div> 
                ))}   
            </div>
        </div>

        {/* ฝั่งตะกร้าสินค้า (สรุปยอด) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200 h-fit sticky top-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">ตะกร้าสินค้า</h3>
            {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-4">ยังไม่ได้เลือกเมนูอาหาร</p>
            ) : (
                <>
                <ul className="space-y-4 mb-4">
                    {cart.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm text-gray-600">
                            <span>{item.name} x {item.count}</span>
                            <span>{item.price * item.count},.-</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">รวมทั้งสิ้น</span>
                        <span className="text-2xl font-bold text-orange-600">{totalPrice},.-</span>
                    </div>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95"> สั่งอาหารเลย! </button>
                    <button
                    onClick={() => setCart([])}
                    className="w-full mt-2 text-gray-400 text-xs hover:text-red-400 transition-colors">ล้างตะกร้า</button>
                </div>
                </>
            )}
        </div>
        </div>
        )
}