
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity?: number;
  minQuantity?: number;
}

export function QuantitySelector({ 
  quantity, 
  setQuantity, 
  maxQuantity = 99, 
  minQuantity = 1 
}: QuantitySelectorProps) {
  
  const increment = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = minQuantity;
    if (value < minQuantity) value = minQuantity;
    if (value > maxQuantity) value = maxQuantity;
    setQuantity(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={decrement}
        disabled={quantity <= minQuantity}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleChange}
        className="w-16 text-center h-10"
        min={minQuantity}
        max={maxQuantity}
        aria-label="Current quantity"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={increment}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
