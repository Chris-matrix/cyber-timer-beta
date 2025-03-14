
import React from 'react';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalyticsLinkProps {
  className?: string;
}

const AnalyticsLink = ({ className }: AnalyticsLinkProps) => {
  return (
    <Link to="/analytics">
      <Button
        variant="outline"
        size="sm"
        className={className}
      >
        <LineChart className="h-4 w-4 mr-1" />
        Analytics
      </Button>
    </Link>
  );
};

export default AnalyticsLink;
