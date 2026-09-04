"use client"

import { useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"

type Props = {
  priceId: string | null
  children: React.ReactNode
} & Pick<ButtonProps, "variant" | "className">

export default function CheckoutButton({ priceId, children, variant, className }: Props) {
  const [loading, setLoading] = useState(false)

  if (!priceId) {
    return (
      <Button variant={variant} className={className} disabled title="This tier isn't connected to Stripe yet">
        {children}
      </Button>
    )
  }

  const startCheckout = async () => {
    setLoading(true)
    try {
      const result = await axios.post("/api/checkout/stripe", { priceId })
      if (result.data.url) {
        window.location.href = result.data.url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} className={className} onClick={startCheckout} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
      {children}
    </Button>
  )
}
