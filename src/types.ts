export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}


export interface Product {
  description: string;
  id: string;
  image_url: string;
  name: string;
  website_url: string;
}