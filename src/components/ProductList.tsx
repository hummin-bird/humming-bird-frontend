
import React from "react";
import { Product } from "@/types";

interface Props {
  products: Product[] | [];
}

const ProductList: React.FC<Props> = ({ products }) => {
  // If products is undefined or empty, return null
  if (!products || products.length === 0) {
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
            <div className="flex-shrink-0">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-16 h-16 rounded-md object-cover"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-hummingbird-primary">{product.name}</h3>
              <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
              <a 
                href={product.website_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-hummingbird-accent hover:underline mt-auto self-end"
              >
                Visit Website
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
