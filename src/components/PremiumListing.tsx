import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumListingProps {
  name: string;
  description: string;
  logoUrl: string;
}

const PremiumListing: React.FC<PremiumListingProps> = ({
  name,
  description,
  logoUrl,
}) => {
  return (
    <a 
      href="https://www.portialabs.ai/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="gradient-border-wrapper relative w-full max-w-md mx-auto mt-4">
        <div className="gradient-border">
          <Card className="bg-hummingbird-dark/30 rounded-lg shadow-lg overflow-hidden border-none">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                <div className="flex-shrink-0 bg-white p-2 rounded-md w-16 h-16 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="max-w-full max-h-full"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-hummingbird-accent font-semibold text-lg">
                    {name}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">{description}</p>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-hummingbird-primary/20 text-hummingbird-primary rounded-full">
                      Premium Partner
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </a>
  );
};

export default PremiumListing;
