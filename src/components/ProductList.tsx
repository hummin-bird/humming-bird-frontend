import React, { useState } from "react";
import { Product } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  products: Product[] | [];
}

const ProductList: React.FC<Props> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // If products is undefined or empty, return null
  if (!products || products.length === 0 || !Array.isArray(products)) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-hummingbird-dark/30 rounded-lg shadow-md mb-6 mt-2 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex gap-3 p-3 bg-hummingbird-dark rounded-md hover:bg-hummingbird-dark/70 transition-colors"
          >
            <div className="flex-shrink-0 items-center justify-center flex">
              <img
                src={product.image_url}
                alt={product.name}
                className="max-w-16 max-h-16 rounded-md object-contain"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-hummingbird-primary">
                {product.name}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2">
                {product.description}
              </p>

              <div className="flex justify-between mt-auto ml-auto items-center">
                <a
                  href={product.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-hummingbird-accent hover:underline"
                >
                  Visit Website
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-hummingbird-accent hover:text-hummingbird-accent/90 ml-2"
                  onClick={() => {
                    setSelectedProduct(product);
                    setDialogOpen(true);
                  }}
                >
                  View More
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedProduct && (
          <DialogContent className="bg-hummingbird-dark text-white max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-hummingbird-primary">
                {selectedProduct.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 my-4">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <p className="text-gray-300">{selectedProduct.description}</p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setDialogOpen(false)}
                className="bg-hummingbird-accent text-white hover:bg-hummingbird-accent/90"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default ProductList;
