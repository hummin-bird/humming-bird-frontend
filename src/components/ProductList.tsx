// src/components/ProductList.tsx

import React from "react";
import { Product } from "@/types";

interface Props {
  products: Product[] | [];
}

const ProductList: React.FC<Props> = ({ products }) => {
  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <img src={product.image_url} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <a href={product.website_url}>Visit Website</a>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
